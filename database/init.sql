CREATE DATABASE IF NOT EXISTS taskmanager;

USE taskmanager;

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tasks (title)
VALUES
('Learn Docker'),
('Learn Terraform'),
('Deploy Task Manager');