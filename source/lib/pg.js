/* Code created by Townsy#0001 https://townsy.dev/ https://github.com/Townsy45 (DO NOT REMOVE THIS LINE) */
const pg = require('pg');
const fs = require('fs');
const CONFIG = JSON.parse(fs.readFileSync('./config/dataconf.json', 'utf-8'));
const log = require('./utils/log');

// Setup the database connection info
let dbConnectionObject = CONFIG.db_info;
if (process.env.DBHOST) dbConnectionObject.host = process.env.DBHOST;
if (process.env.DBPASS) dbConnectionObject.password = process.env.DBPASS;

const p = new pg.Client(CONFIG.db_info);

async function connect() {
  await p.connect(async err => {
    if (err) await log.error('Database Connection Error', err.message);
    else await log.info('Database Connected!');
  });
}

function query(sql) {
  return new Promise(async (resolve, reject) => {
    // Do pg query stuff here
    p.query(sql, (err, res) => {
      if (err) reject(err);
      if (res && res.rowCount > 1) resolve(res.rows);
      resolve(res && res.rows ? res.rows[0] : res);
    });
  });
}

module.exports = { query, connect };
