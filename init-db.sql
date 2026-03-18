CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
);

CREATE TABLE IF NOT EXISTS auctions (
    id SERIAL PRIMARY KEY,
    name TEXT,
    bid_start_time TIMESTAMPTZ,
    bid_close_time TIMESTAMPTZ,
    forced_close_time TIMESTAMPTZ,
    trigger_window_minutes INT,
    extension_duration_minutes INT,
    trigger_type TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    auction_id INT REFERENCES auctions(id),
    supplier_id INT REFERENCES users(id),
    price NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    auction_id INT,
    event_type TEXT,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
