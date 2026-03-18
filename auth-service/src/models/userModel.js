const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'auction_db',
});

const User = {
  create: async (username, password, role) => {
    const query = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role';
    const values = [username, password, role];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },
  findByUsername: async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await pool.query(query, [username]);
    return rows[0];
  }
};

module.exports = User;
