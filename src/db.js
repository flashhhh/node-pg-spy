import pg from 'pg';

pg.defaults.host = global.options.host;
pg.defaults.port = global.options.port;
pg.defaults.user = global.options.logUser;
pg.defaults.password = global.options.logPassword;
pg.defaults.database = global.options.logDb;

export default pg;
