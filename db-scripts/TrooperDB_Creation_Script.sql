DROP DATABASE IF EXISTS trooperdb;
CREATE DATABASE IF NOT EXISTS trooperdb;
USE trooperdb;

/**
DROP TABLE IF EXISTS gamers_jobs_applications;
DROP TABLE IF EXISTS gamers_jobs_asked;
DROP TABLE IF EXISTS gamers_games;
DROP TABLE IF EXISTS gamers_roles;
DROP TABLE IF EXISTS jobs_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS guilds;
DROP TABLE IF EXISTS gamers; 
**/

CREATE TABLE gamers (
    gamer_id CHAR(36) PRIMARY KEY NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
	date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    profile_type ENUM('Gamer', 'Recruiter', 'Guild Manager') DEFAULT 'Gamer' NOT NULL,
    
	birthdate DATE,
	description TEXT,
    
	location VARCHAR(255),
	name_discord VARCHAR(255),
	link_twitter VARCHAR(255),
    link_linkedin VARCHAR(255),
	link_facebook VARCHAR(255),
    
    /** gamers specific columns **/
	min_hour_rate DECIMAL(10.2),
    hours_per_day INT,
    total_earned DECIMAL(10,2)
    
    /** guild master specific columns **/
);

/**CREATE TABLE guilds (
	id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
    guild_name VARCHAR(255) NOT NULL,
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    description TEXT
);*/

CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(255) NOT NULL UNIQUE
);
INSERT INTO roles (role_name) VALUES ("farmer"), ("healer"), ("tank"), ("dps"), ("trader"), ("booster");

CREATE TABLE games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    game_name VARCHAR(255) NOT NULL UNIQUE
);
INSERT INTO games (game_name) VALUES ("GTA V"), ("FIFA"), ("LOL"), ("WOW"), ("Hearthstone"), ("COD");

CREATE TABLE jobs (
    job_id CHAR(36) PRIMARY KEY NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    short_description VARCHAR(255),
    description TEXT,
    game_id INT,
    FOREIGN KEY (game_id) REFERENCES games(id),
    job_state ENUM('Available', 'In progress', 'Done') NOT NULL DEFAULT 'Available',
    
    payment_amount DECIMAL(10,2),
    duration INT,
    
    recruiter_id CHAR(36) NOT NULL,
    FOREIGN KEY (recruiter_id) REFERENCES gamers(gamer_id),
    
    chosen_gamer_id CHAR(36),
    FOREIGN KEY (chosen_gamer_id) REFERENCES gamers(gamer_id)
);



CREATE TABLE gamers_games (
	gamer_id CHAR(36) NOT NULL,
    game_id INT NOT NULL,
    PRIMARY KEY (gamer_id, game_id),
    FOREIGN KEY (gamer_id) REFERENCES gamers(gamer_id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE gamers_roles (
	gamer_id CHAR(36) NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (gamer_id, role_id),
    FOREIGN KEY (gamer_id) REFERENCES gamers(gamer_id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE jobs_roles (
    job_id CHAR(36) NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (job_id, role_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE gamers_jobs_applications (
    gamer_id CHAR(36) NOT NULL,
    job_id CHAR(36) NOT NULL,
    PRIMARY KEY (gamer_id, job_id),
    application_state ENUM ('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (gamer_id) REFERENCES gamers(gamer_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);

CREATE TABLE gamers_jobs_asked (
    gamer_id CHAR(36) NOT NULL,
    job_id CHAR(36) NOT NULL,
    PRIMARY KEY (gamer_id, job_id),
    recruitment_state ENUM ('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (gamer_id) REFERENCES gamers(gamer_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);