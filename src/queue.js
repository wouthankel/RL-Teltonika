const Redis = require('ioredis');
const log = require('./logger');

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const QUEUE_KEY = process.env.QUEUE_KEY || 'teltonika:packets';

// Local buffer for packets received while Redis is unavailable
const localBuffer = [];
const MAX_BUFFER = 100_000;

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  lazyConnect: true,
});

redis.on('connect', () => {
  log.info(null, 'redis_connected', { host: REDIS_HOST, port: REDIS_PORT });
  flushBuffer();
});

redis.on('error', (err) => {
  log.error(null, 'redis_error', { message: err.message });
});

redis.connect().catch(() => {});

async function flushBuffer() {
  while (localBuffer.length > 0 && redis.status === 'ready') {
    const packet = localBuffer.shift();
    try {
      await redis.lpush(QUEUE_KEY, JSON.stringify(packet));
    } catch {
      localBuffer.unshift(packet);
      break;
    }
  }
  if (localBuffer.length > 0) {
    log.warn(null, 'redis_buffer_remaining', { count: localBuffer.length });
  }
}

async function enqueue(packet) {
  if (redis.status === 'ready') {
    try {
      await redis.lpush(QUEUE_KEY, JSON.stringify(packet));
      return;
    } catch (err) {
      log.error(null, 'redis_enqueue_failed', { message: err.message });
    }
  }

  if (localBuffer.length >= MAX_BUFFER) {
    log.error(null, 'local_buffer_full', { dropping: packet.imei });
    return;
  }

  localBuffer.push(packet);
  log.warn(null, 'redis_unavailable_buffered', { buffered: localBuffer.length });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// FIFO t.o.v. enqueue (LPUSH aan de kop, BRPOP haalt van de staart).
// Blokkeert tot er iets is of tot timeoutSeconds verstrijkt (dan null).
// Let op: bij niet-ready redis moet dit een ECHTE wachttijd hebben (setTimeout,
// dus een macrotask) - een direct-resolvende promise hier laat de caller
// (worker.js) in een synchrone while(true)-lus draaien die de event loop
// volledig opeet (microtask-starvation) en zo redis' eigen 'connect'-event
// nooit meer aan bod laat komen. Kostte 100% CPU + permanente deadlock.
async function dequeue(timeoutSeconds = 5) {
  if (redis.status !== 'ready') {
    await sleep(timeoutSeconds * 1000);
    return null;
  }
  try {
    const result = await redis.brpop(QUEUE_KEY, timeoutSeconds);
    if (!result) return null;
    return JSON.parse(result[1]);
  } catch (err) {
    log.error(null, 'redis_dequeue_failed', { message: err.message });
    return null;
  }
}

function queueLength() {
  if (redis.status !== 'ready') return Promise.resolve(localBuffer.length);
  return redis.llen(QUEUE_KEY).catch(() => -1);
}

module.exports = { enqueue, dequeue, queueLength };
