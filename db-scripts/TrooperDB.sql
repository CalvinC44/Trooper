DROP TABLE IF EXISTS gamers_applying_to_jobs;
DROP TABLE IF EXISTS gamer_games;
DROP TABLE IF EXISTS gamer_roles;
DROP TABLE IF EXISTS job_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS guilds;
DROP TABLE IF EXISTS gamers;


CREATE TABLE gamers (
    id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
    username VARCHAR(255) NOT NULL UNIQUE,
	date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    profile_type ENUM('Gamer', 'Recruiter', 'Guild Manager') NOT NULL,
    
	birthdate DATE,
	description TEXT,
    
	location VARCHAR(255),
	name_discord VARCHAR(255),
	link_twitter VARCHAR(255),
    link_linkedin VARCHAR(255),
	link_facebook VARCHAR(255),
    
    /** gamers specific columns **/
	min_hour_rate DECIMAL(7.2),
    hours_per_day DECIMAL(3,1),
    total_earned DECIMAL(7,2)
    
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
    name VARCHAR(255) NOT NULL UNIQUE
);
INSERT INTO roles (name) VALUES ("farmer"), ("healer"), ("tank"), ("dps"), ("trader"), ("booster");

CREATE TABLE games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
);
INSERT INTO games (name) VALUES ("GTA V"), ("FIFA"), ("LOL"), ("WOW"), ("Hearthstone"), ("COD");

CREATE TABLE jobs (
    id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
    job_name VARCHAR(255) NOT NULL,
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    short_description VARCHAR(255),
    description TEXT,
    game_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (game_name) REFERENCES games(name),
    job_state ENUM('Available', 'In progress', 'Done') NOT NULL DEFAULT 'Available',
    
    payment_amount DECIMAL(10,2) NOT NULL,
    duration TIME,
    
    recruiter_id CHAR(36) NOT NULL,
    FOREIGN KEY (recruiter_id) REFERENCES gamers(id),
    
    chosen_gamer_id CHAR(36) NOT NULL,
    FOREIGN KEY (chosen_gamer_id) REFERENCES gamers(id)
);



CREATE TABLE gamer_games (
	gamer_id CHAR(36) NOT NULL,
    game_id INT NOT NULL,
    PRIMARY KEY (gamer_id, game_id),
    FOREIGN KEY (gamer_id) REFERENCES gamers(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE gamer_roles (
	gamer_id CHAR(36) NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (gamer_id, role_id),
    FOREIGN KEY (gamer_id) REFERENCES gamers(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE job_roles (
    job_id CHAR(36) NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (job_id, role_id),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE gamers_applying_to_jobs (
    gamer_id CHAR(36) NOT NULL,
    job_id CHAR(36) NOT NULL,
    PRIMARY KEY (gamer_id, job_id),
    request_state ENUM ('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (gamer_id) REFERENCES gamers(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

/** DELIMITER //
CREATE TRIGGER update_chosen_gamer
AFTER UPDATE ON gamers_applying_to_jobs
FOR EACH ROW
BEGIN
   IF NEW.request_state = 'Approved' THEN
       UPDATE jobs
       SET chosen_gamer_id = NEW.gamer_id
       WHERE id = NEW.job_id;
   END IF;
END;
//
DELIMITER ; **/