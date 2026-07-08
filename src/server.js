const tls = require('tls');
const fs = require('fs');
const path = require('path');
const { parseImei, parseAvlPacket } = require('./parser');
const log = require('./logger');
const { enqueue } = require('./queue');
const api = require('./api');

const PORT = process.env.PORT || 5027;
const CERT_PATH = process.env.TLS_CERT_PATH || path.join(__dirname, '../certs/server.crt');
const KEY_PATH = process.env.TLS_KEY_PATH || path.join(__dirname, '../certs/server.key');

const tlsOptions = {
  cert: fs.readFileSync(CERT_PATH),
  key: fs.readFileSync(KEY_PATH),
};

const server = tls.createServer(tlsOptions, (socket) => {
  const remote = `${socket.remoteAddress}:${socket.remotePort}`;
  let imei = null;
  let buffer = Buffer.alloc(0);
  let imeiReceived = false;

  log.info(null, 'connection_open', { remote });

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    if (!imeiReceived) {
      const parsedImei = parseImei(buffer);
      if (!parsedImei) return; // wait for more data

      imei = parsedImei;
      imeiReceived = true;
      buffer = Buffer.alloc(0);

      log.info(imei, 'imei_received', { remote, imei });

      // Accept device
      socket.write(Buffer.from([0x01]));
      return;
    }

    // Wait for full packet (preamble 4 bytes + data length 4 bytes = 8 bytes header)
    if (buffer.length < 8) return;

    const dataLength = buffer.readUInt32BE(4);
    const totalExpected = 8 + dataLength + 4; // preamble(4) + length(4) + data + crc(4)

    if (buffer.length < totalExpected) return; // wait for more data

    const packet = buffer.slice(0, totalExpected);
    buffer = buffer.slice(totalExpected);

    log.raw(imei, packet.toString('hex'));

    const parsed = parseAvlPacket(packet);

    if (!parsed) {
      log.warn(imei, 'parse_failed', { hex: packet.toString('hex') });
      return;
    }

    if (parsed.error) {
      log.warn(imei, 'unsupported_codec', parsed);
      return;
    }

    if (!parsed.crcOk) {
      log.warn(imei, 'crc_mismatch', { received: parsed.crcReceived, calculated: parsed.crcCalculated });
    }

    log.info(imei, 'avl_data', {
      codec: parsed.codecId,
      records: parsed.recordCount,
      crcOk: parsed.crcOk,
      data: JSON.parse(JSON.stringify(parsed.records)),
    });

    const payload = {
      imei,
      received_at: new Date().toISOString(),
      codec: parsed.codecId,
      crc_ok: parsed.crcOk,
      records: parsed.records,
    };

    enqueue(payload);
    api.send(payload);

    // ACK: 4-byte number of accepted records
    const ack = Buffer.alloc(4);
    ack.writeUInt32BE(parsed.recordCount, 0);
    socket.write(ack);
  });

  socket.on('end', () => {
    log.info(imei, 'connection_closed', { remote });
  });

  socket.on('error', (err) => {
    log.error(imei, 'socket_error', { remote, message: err.message });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\x1b[32mTeltonika TCP server listening on 0.0.0.0:${PORT}\x1b[0m`);
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});
