-- CIT OutpassX schema (reconstructed from the queries in Backend/routes)

CREATE TABLE IF NOT EXISTS parents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS advisors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS hods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS floor_incharges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  hostel VARCHAR(50) NOT NULL,
  floor INT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  register_no VARCHAR(30) NOT NULL UNIQUE,
  hostel VARCHAR(50) NOT NULL,
  floor INT NOT NULL,
  parent_id INT,
  advisor_id INT,
  FOREIGN KEY (parent_id) REFERENCES parents(id),
  FOREIGN KEY (advisor_id) REFERENCES advisors(id)
);

CREATE TABLE IF NOT EXISTS outpasses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  parent_id INT,
  advisor_id INT,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  reason VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PARENT',
  otp INT,
  parent_approval TINYINT(1) NULL,
  advisor_approval TINYINT(1) NULL,
  hod_approval TINYINT(1) NULL,
  floor_incharge_approval TINYINT(1) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (parent_id) REFERENCES parents(id),
  FOREIGN KEY (advisor_id) REFERENCES advisors(id)
);

CREATE TABLE IF NOT EXISTS otp_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL,
  otp INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (email, role)
);
