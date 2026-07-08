const log = require('./logger');

const BASE_URL = process.env.HUB_INGEST_URL;
const TOKEN = process.env.TELTONIKA_INGEST_TOKEN;
const ENDPOINT = '/api/fms/ingest/teltonika';
const TIMEOUT_MS = parseInt(process.env.HUB_INGEST_TIMEOUT_MS || '30000', 10);
const RETRY_ATTEMPTS = parseInt(process.env.HUB_INGEST_RETRY_ATTEMPTS || '3', 10);
const RETRY_DELAY_MS = parseInt(process.env.HUB_INGEST_RETRY_DELAY_MS || '1000', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Hub verwacht een los event per AVL record (packet_id, device_serial, recorded_at, lat/lng, ...).
async function send(payload) {
  if (!BASE_URL || !TOKEN) return;

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

    await sendRecord(payload.imei, packetId, body);
  }
}

async function sendRecord(imei, packetId, body) {
  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const res = await postRecord(body);

      if (res.ok) {
        return;
      }

      const responseBody = await res.text();
      const context = {
        status: res.status,
        packet_id: packetId,
        attempt,
        attempts: RETRY_ATTEMPTS,
        body: responseBody.slice(0, 300),
      };

      if (res.status < 500 || attempt === RETRY_ATTEMPTS) {
        log.warn(imei, 'hub_ingest_failed', context);
        return;
      }

      log.warn(imei, 'hub_ingest_retry', context);
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
