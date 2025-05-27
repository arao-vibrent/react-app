-- Create database if not exists
CREATE DATABASE IF NOT EXISTS surveydb;
USE surveydb;

-- Create survey_designs table if not exists
CREATE TABLE IF NOT EXISTS survey_designs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    design JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create responses table if not exists
CREATE TABLE IF NOT EXISTS responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    response JSON NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES survey_designs(id)
);

-- Add participant_id column if not exists
SET @sql = (
    SELECT IF(
        NOT EXISTS(
            SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'surveydb'
            AND TABLE_NAME = 'responses'
            AND COLUMN_NAME = 'participant_id'
        ),
        'ALTER TABLE responses ADD COLUMN participant_id BIGINT NULL',
        'SELECT 1'
    )
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
