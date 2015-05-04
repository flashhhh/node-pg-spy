import bunyan from 'bunyan';
import path from 'path';

export default bunyan.createLogger({
  name: 'APP',
  streams: [{
    level: 'debug',
    stream: process.stdout
  }, {
    level: 'info',
    path: path.join(__dirname, '/../.log/general.log'),
    type: 'rotating-file',
    period: '1d',
    count: 3
  }]
});
