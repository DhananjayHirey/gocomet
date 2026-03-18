const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'auction_db',
});

const Auction = {
  create: async (data) => {
    const { name, bid_start_time, bid_close_time, forced_close_time, trigger_window_minutes, extension_duration_minutes, trigger_type } = data;
    const query = `
      INSERT INTO auctions 
      (name, bid_start_time, bid_close_time, forced_close_time, trigger_window_minutes, extension_duration_minutes, trigger_type, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`;
    const values = [name, bid_start_time, bid_close_time, forced_close_time, trigger_window_minutes, extension_duration_minutes, trigger_type, 'ACTIVE'];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },
  findAll: async () => {
    const { rows } = await pool.query('SELECT * FROM auctions ORDER BY id DESC');
    return rows;
  },
  findById: async (id) => {
    const { rows } = await pool.query('SELECT * FROM auctions WHERE id = $1', [id]);
    return rows[0];
  }
};

module.exports = Auction;
