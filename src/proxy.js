import net from 'net';
import log from './log.js';

export default function(options, onConnect) {
  // proxy server
  let proxy = net.createServer(function(client) {
    let server;

    // Create a new connection to the target server
    server = net.connect(options.port);

    // 2-way pipe between proxy and target server
    client.pipe(server).pipe(client);

    client.on('close', function() {
      server.end();
    });

    server.on('close', function() {
      client.end();
    });

    client.on('error', function(err) {
      log.error('Client: ' + err.toString());
      client.end();
      server.end();
    });

    server.on('error', function(err) {
      log.error('Server: ' + err.toString());
      client.end();
      server.end();
    });

    onConnect(client, server);
  });

  proxy.listen(options.proxyPort);
}

