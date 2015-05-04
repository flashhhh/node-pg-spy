import _messageParse from '../messageParse/messageParse.js';

export default function messageParse(client, server) {
  client.on('data', (buffer) => {
    buffer.message = _messageParse(buffer, 'client');
  });

  server.on('data', (buffer) => {
    buffer.message = _messageParse(buffer, 'server');
  });
}
