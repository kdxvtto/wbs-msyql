CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action ENUM('create', 'update', 'delete') NOT NULL,
  resource ENUM('complaint', 'response', 'category', 'user') NOT NULL,
  resource_name VARCHAR(255) NOT NULL,
  resource_id INT NOT NULL,
  user_id INT NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
