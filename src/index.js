import 'babel/polyfill';
import log from './log.js';

let throwError = function() {
  log.fatal(...arguments);
  throw Error(...arguments);
};

//Options initiation
import options from './config.js';
log.debug('Options have been initiated', options);

//Creating table
import db from './db.js';
db.connect((err, dbClient, dbDone) => {
  if (err) {throwError(err); }
  dbClient.query(`CREATE TABLE IF NOT EXISTS query (
      text TEXT NOT NULL,
      error TEXT,
      notices TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      tags VARCHAR[] NOT NULL DEFAULT '{}',
      "user" TEXT NOT NULL,
      session_uid TEXT NOT NULL
    );`, (err) => {
      dbDone();
      if (err) {throwError(err); }
    });
});

//Proxy initiation
import proxy from './proxy.js';

const listeners = [
  'messageParse.js',
  'sessionManager.js',
  'queryLog.js'
];

process.on('uncaughtException', (err) => {
  throwError(err);
});

proxy(options, (client, server) => {
  let session = {};
  for (let listener of listeners) {
    require('./listeners/' + listener)(client, server, throwError, session);
  }
});
