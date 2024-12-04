DROP DATABASE IF EXISTS enem_exams;

CREATE DATABASE enem_exams;
USE enem_exams;

CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year YEAR NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    question_number INT NOT NULL,
    year YEAR NOT NULL,
    language ENUM('ingles', 'espanhol') NULL,
    discipline ENUM('ciencias-humanas', 'ciencias-natureza', 'linguagens', 'matematica') NULL,
    context TEXT NULL,
    correct_alternative VARCHAR(1) NOT NULL,
    files JSON NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE alternatives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    text TEXT NULL,
    is_correct BOOLEAN NOT NULL,
    file VARCHAR(255) NULL,
    letter VARCHAR(1) NOT NULL,
    
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE exam_question (
    exam_id INT NOT NULL,
    question_id INT NOT NULL,

    PRIMARY KEY (exam_id, question_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
