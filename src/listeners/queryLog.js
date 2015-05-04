import db from '../db.js';
import _async from 'async';
import log from './../log.js';
import util from 'util';
import querySplit from '../querySplit.js';

let queriesQueue = [];
let queriesReports = [];
let notices = [];

function isEditQuery(text) {
  let keywords = [
    'INSERT',
    'UPDATE',
    'DELETE',
    'CREATE',
    'ALTER',
    'DROP',
    'BEGIN',
    'COMMIT',
    'ROLLBACK',
    'PERFORM'
  ];
  
  let regExpJoin = keywords.join('|');
  
  return text.match(`\\b(${regExpJoin})\\b`, 'i');
}

function isUsefulQuery(text) {
  if (!text) {
    return false;
  }

  return isEditQuery(text);
}

function insertQuery(text, error, noticeMsg, tags, session) {
  let _dbDone;
  return new Promise((resolve, reject) => {
    _async.waterfall([
      (cb) => {
        db.connect(cb);
      }, (dbClient, dbDone, cb) => {
        _dbDone = dbDone;
        if (isUsefulQuery(text)) {
          dbClient.query(
            'INSERT INTO query(text, error, notices, tags, "user", session_uid)'
            + 'VALUES($1, $2, $3, $4, $5, $6)',
            [
              text,
              error,
              noticeMsg,
              tags,
              session.settings['session_authorization'],
              session.uid
            ],
            cb
          );
        } else {
          cb(null);
        }
      }
    ], (err) => {
      if (err) {
        reject(err);
      }

      _dbDone();
      resolve();
    });
  });
}

function getNotices(commandNum = null) {
  let _notices = notices;
  if (commandNum !== null) {
    _notices = notices.filter((notice) => notice.commandNum === commandNum);
  }
  
  return _notices
    .map((notice) => {
      return `${notice.parsed.S}: ${notice.parsed.M}`;
    })
    .join('\n');
}

export default function queryLog(client, server, throwError, session) {
  client.on('data', (buffer) => {
    let message = buffer.message;
    log.info('Client msg:', util.inspect(message, {depth: 5}));
    if (message.type === 'Messages') {
      message.data.forEach((command) => {
        if (command.type === 'Q') {
          queriesQueue.push(command.parsed);
        }
      });
    }
  });
  
  server.on('data', (buffer) => {
    let message = buffer.message;
    log.info('Server msg:', util.inspect(message, {depth: 5}));
    if (message.type === 'Messages') {
      message.data.forEach((command) => {
        if (
          ['C', 'E'].indexOf(command.type) !== -1 &&
          queriesQueue.length > 0
        ) {
          queriesReports.push(command);
        } else if (command.type === 'E') {
          throwError(command.parsed.M);
        } else if (command.type === 'C') {
          throwError('Unexpected CommandComplete!');
        }
        
        if (command.type === 'N') {
          command.commandNum = queriesReports.length;
          notices.push(command);
        }

        if (command.type === 'Z') {
          if (queriesQueue.length === 0) {
            // if we just have connected, initial ReadyForQuery
            return;
          }

          let lastQuery = queriesQueue.shift();
          let split = querySplit(lastQuery);
          
          queriesReports.forEach((report, i) => {
            // if it is a parse error - it is about whole query
            if (
              report.type === 'E' &&
              report.parsed.R === 'scanner_yyerror'
            ) {
              insertQuery(
                lastQuery,
                report.parsed.M,
                getNotices(),
                ['alpha'],
                session
              ).catch(throwError);
              return;
            }
            
            //otherwise, each report is about appropriate statement
            insertQuery(
              split[i],
              report.type === 'E' ? report.parsed.M : null,
              getNotices(i),
              ['alpha'],
              session
            ).catch(throwError);
          });
          
          queriesReports = [];
          notices = [];
        }
      });
    }
  });
}
