CREATE TABLE complaints (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT NOT NULL,
 category_id INT NOT NULL,
 location VARCHAR(100) NOT NULL,
 `condition` VARCHAR(100) NOT NULL,
 description VARCHAR(255) NOT NULL,
 status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 
 FOREIGN KEY (user_id) REFERENCES users(id),
 FOREIGN KEY (category_id) REFERENCES categories(id)
);