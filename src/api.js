const log = require('./logger');

const BASE_URL = process.env.HUB_INGEST_URL;
const TOKEN = process.env.TELTONIKA_INGEST_TOKEN;
const ENDPOINT = '/api/fms/ingest/teltonika';
const TIMEOUT_MS = parseInt(process.env.HUB_INGEST_TIMEOUT_MS || '30000', 10);
const RETRY_ATTEMPTS = parseInt(process.env.HUB_INGEST_RETRY_ATTEMPTS || '3', 10);
const RETRY_DELAY_MS = parseInt(process.env.HUB_INGEST_RETRY_DELAY_MS || '1000', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Hub verwacht een los event per AVL record (packet_id, device_serial, recorded_at, lat/lng, ...).
// Retourneert true als alle records zijn afgeleverd, false als er minstens één
// record blijvend faalde (na retries) - de caller (worker) requeuet dan het
// hele packet, dus Hub-side idempotency (packet_id) moet dubbele records afvangen.
async function send(payload) {
  if (!BASE_URL || !TOKEN) return true;

  let allOk = true;

  for (const record of payload.records) {
    const packetId = `${payload.imei}-${record.timestamp}`;

    const body = {
      packet_id: packetId,
      device_serial: payload.imei,
      recorded_at: record.timestamp,
      latitude: record.gps.lat,
      longitude: record.gps.lon,
      altitude: record.gps.altitude,
      angle: record.gps.angle,
      satellites: record.gps.satellites,
      speed_kmh: record.gps.speed_kmh,
      crc_valid: payload.crc_ok,
      io: record.io,
    };

    const ok = await sendRecord(payload.imei, packetId, body);
    if (!ok) allOk = false;
  }

  return allOk;
}

// Retryable: 429 (rate limit) en 5xx (server-kant). 4xx (behalve 429) is een
// permanente afwijzing (bv. malformed payload) - opnieuw proberen lost niets op.
function isRetryableStatus(status) {
  return status === 429 || status >= 500;
}

async function sendRecord(imei, packetId, body) {
  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const res = await postRecord(body);

      if (res.ok) {
        return true;
      }

      const responseBody = await res.text();
      const context = {
        status: res.status,
        packet_id: packetId,
        attempt,
        attempts: RETRY_ATTEMPTS,
        body: responseBody.slice(0, 300),
      };

      if (!isRetryableStatus(res.status)) {
        log.warn(imei, 'hub_ingest_rejected', context);
        return true; // permanente afwijzing, niet opnieuw in de queue zetten
      }

      if (attempt === RETRY_ATTEMPTS) {
        log.warn(imei, 'hub_ingest_failed', context);
        return false;
      }

      log.warn(imei, 'hub_ingest_retry', context);

      const retryAfterMs = parseRetryAfter(res.headers.get('retry-after'));
      await sleep(retryAfterMs ?? RETRY_DELAY_MS * attempt);
      continue;
    } catch (err) {
      lastError = err;

      if (attempt === RETRY_ATTEMPTS) {
        break;
      }

      log.warn(imei, 'hub_ingest_retry', {
        message: err.message,
        packet_id: packetId,
        attempt,
        attempts: RETRY_ATTEMPTS,
        timeout_ms: TIMEOUT_MS,
      });
    }

    await sleep(RETRY_DELAY_MS * attempt);
  }

  log.warn(imei, 'hub_ingest_error', {
    message: lastError?.message || 'Hub ingest request failed',
    packet_id: packetId,
    attempts: RETRY_ATTEMPTS,
    timeout_ms: TIMEOUT_MS,
  });
  return false;
}

function parseRetryAfter(headerValue) {
  if (!headerValue) return null;
  const seconds = Number(headerValue);
  if (Number.isFinite(seconds)) return seconds * 1000;
  const dateMs = Date.parse(headerValue);
  return Number.isFinite(dateMs) ? Math.max(0, dateMs - Date.now()) : null;
}

function postRecord(body) {
  return fetch(`${BASE_URL}${ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Teltonika-Token': TOKEN,
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

module.exports = { send };
