const fs = require('fs');
const path = require('path');
const util = require('util');

const logsDir = path.join(__dirname, '..', 'logs');

function getLogFile() {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(logsDir, `teltonika-${date}.log`);
}

function timestamp() {
  return new Date().toISOString();
}

function write(level, imei, event, data) {
  const entry = { ts: timestamp(), level, imei: imei || 'unknown', event, ...data };
  const line = JSON.stringify(entry);

  // stdout pretty
  const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[36m';
  console.log(`${color}[${entry.ts}] [${level}] [${entry.imei}] ${event}\x1b[0m`, util.inspect(data, { depth: null, colors: true }));

  // file
  fs.appendFileSync(getLogFile(), line + '\n');
}

module.exports = {
  info: (imei, event, data = {}) => write('INFO', imei, event, data),
  warn: (imei, event, data = {}) => write('WARN', imei, event, data),
  error: (imei, event, data = {}) => write('ERROR', imei, event, data),
  raw: (imei, hex) => write('RAW', imei, 'raw_packet', { hex }),
};
