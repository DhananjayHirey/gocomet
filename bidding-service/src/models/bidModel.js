const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'auction_db',
});

const Bid = {
  save: async (auction_id, supplier_id, price) => {
    const query = 'INSERT INTO bids (auction_id, supplier_id, price) VALUES ($1, $2, $3)';
    return await pool.query(query, [auction_id, supplier_id, price]);
  },
  updateAuctionCloseTime: async (auction_id, new_close_time) => {
    const query = 'UPDATE auctions SET bid_close_time = $1 WHERE id = $2';
    return await pool.query(query, [new_close_time, auction_id]);
  },
  getAuctionMetadata: async (auction_id) => {
    const query = 'SELECT * FROM auctions WHERE id = $1';
    const { rows } = await pool.query(query, [auction_id]);
    return rows[0];
  },
  getHistory: async (auction_id) => {
    const query = `
      SELECT b.*, u.username as supplier_name 
      FROM bids b 
      LEFT JOIN users u ON b.supplier_id = u.id 
      WHERE b.auction_id = $1 
      ORDER BY b.created_at DESC
    `;
    const { rows } = await pool.query(query, [auction_id]);
    return rows;
  }
};

module.exports = { Bid, pool };
