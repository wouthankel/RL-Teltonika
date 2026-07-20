const log = require('./logger');
const { enqueue, dequeue, queueLength } = require('./queue');
const api = require('./api');

const BACKOFF_START_MS = 2000;
const BACKOFF_MAX_MS = 60_000;
const STATS_INTERVAL_MS = 60_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let running = false;
let backoffMs = 0;

async function processOne() {
  const packet = await dequeue(5);
  if (!packet) return;

  const ok = await api.send(packet);

  if (ok) {
    backoffMs = 0;
    return;
  }

  // Blijvend gefaald na de retries in api.send() - terug de queue in, achter
  // het huidige werk aan (enqueue = LPUSH = nieuwste kop, dus verderop in de
  // FIFO-volgorde dan wat er al lag).
  await enqueue(packet);
  backoffMs = backoffMs === 0 ? BACKOFF_START_MS : Math.min(backoffMs * 2, BACKOFF_MAX_MS);
  log.warn(packet.imei, 'hub_ingest_backoff', { backoff_ms: backoffMs });
  await sleep(backoffMs);
}

async function run() {
  if (running) return;
  running = true;

  const statsTimer = setInterval(async () => {
    const len = await queueLength();
    if (len > 0) log.info(null, 'queue_depth', { length: len });
  }, STATS_INTERVAL_MS);
  statsTimer.unref();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await processOne();
    } catch (err) {
      log.error(null, 'worker_loop_error', { message: err.message });
      await sleep(1000);
    }
  }
}

module.exports = { run };
