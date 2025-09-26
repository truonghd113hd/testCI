-- Mock data cho load testing
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert mock users cho testing
INSERT INTO users (username, email, password_hash) VALUES 
('testuser1', 'test1@example.com', '$2b$10$dummy.hash.for.testing'),
('testuser2', 'test2@example.com', '$2b$10$dummy.hash.for.testing'),
('loadtest', 'loadtest@example.com', '$2b$10$dummy.hash.for.testing');

-- Insert mock products
INSERT INTO products (name, price, stock) VALUES 
('Test Product 1', 99.99, 100),
('Test Product 2', 149.99, 50),
('Load Test Item', 29.99, 1000);

-- Create indexes for performance testing
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_name ON products(name);