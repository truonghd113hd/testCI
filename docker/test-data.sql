-- Mock data cho load testing
-- Xoá dữ liệu cũ nếu có
DELETE FROM "user_credential";
DELETE FROM "user";
-- Insert mock data cho user table (NestJS entities)
INSERT INTO "user" (id, full_name, email, username, status, date_of_birth, gender, phone_number, height_cm, weight_kg, created_at, updated_at) VALUES 
(1, 'Test User 1', 'test1@example.com', 'testuser1', 'active', '1990-01-01', 'male', '0123456789', 170, 70, NOW(), NOW()),
(2, 'Test User 2', 'test2@example.com', 'testuser2', 'active', '1992-05-15', 'female', '0987654321', 160, 55, NOW(), NOW()),
(3, 'Load Test User', 'loadtest@example.com', 'loadtest', '1988-12-25', 'male', '0555666777', 175, 80, NOW(), NOW());

-- Insert mock data cho user-credential table
INSERT INTO "user_credential" (id, user_id, password, created_at, updated_at) VALUES 
(1, 1, '$2b$10$Rah5NRDnVwR7eZHSMG7J8OlOwQRnnlHimQceFeUPNSbete7EZi7wq', NOW(), NOW()),
(2, 2, '$2b$10$Rah5NRDnVwR7eZHSMG7J8OlOwQRnnlHimQceFeUPNSbete7EZi7wq', NOW(), NOW()),
(3, 3, '$2b$10$Rah5NRDnVwR7eZHSMG7J8OlOwQRnnlHimQceFeUPNSbete7EZi7wq', NOW(), NOW());
-- Lưu ý: Password hash trên tương ứng với mật khẩu 'password123'