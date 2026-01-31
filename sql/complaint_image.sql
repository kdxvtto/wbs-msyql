CREATE TABLE complaint_images (
 id INT AUTO_INCREMENT PRIMARY KEY,
 complaint_id INT NOT NULL,
 image_url VARCHAR(255) NOT NULL,
 FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);
