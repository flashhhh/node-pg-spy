import log from './../log.js';

export default function sessionManager(client, server, throwError, session) {
  session.settings = {};
  session.startTime = Date.now();
  session.uid = `${session.startTime}-${Math.floor(Math.random() * 100)}`;

  log.info('Client connected', session);

  server.on('data', (buffer) => {
    let message = buffer.message;
    
    if (message.type === 'Messages') {
      message.data.forEach((command) => {
        if (command.type === 'S') {
          session.settings[command.parsed.key] = command.parsed.value;
        }
      });
    }
  });
  
  server.on('close', () => {
    log.info('Client disconnected', session);
  });
}
