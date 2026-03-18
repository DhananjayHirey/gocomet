const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password',
  database: 'auction_db',
});
pool.query('SELECT * FROM bids', (err, res) => {
  if (err) console.error(err);
  else console.table(res.rows);
  pool.end();
});
