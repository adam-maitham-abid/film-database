DROP TABLE IF EXISTS film_database.favourites;
DROP TABLE IF EXISTS film_database.users;
DROP TABLE IF EXISTS film_database.film_genres;
DROP TABLE IF EXISTS film_database.genres;
DROP TABLE IF EXISTS film_database.films;

CREATE TABLE film_database.users (
	user_id SERIAL PRIMARY KEY,
	username VARCHAR(32) UNIQUE NOT NULL,
	password CHAR(60)
);

CREATE TABLE film_database.films (
	film_id SERIAL PRIMARY KEY,
	title VARCHAR(128),
	cover VARCHAR(128),
	tagline VARCHAR(256),
	synopsis VARCHAR(2048),
	backdrop VARCHAR(128),
	rating REAL,
	popularity REAL,
	release_date DATE
);

CREATE TABLE film_database.genres (
	genre_id SERIAL PRIMARY KEY,
	genre_name VARCHAR(32)
);

CREATE TABLE film_database.film_genres (
	film_id INTEGER,
	genre_id INTEGER,
	PRIMARY KEY (film_id, genre_id),
	FOREIGN KEY (film_id) REFERENCES film_database.films(film_id),
	FOREIGN KEY (genre_id) REFERENCES film_database.genres(genre_id)
);

CREATE TABLE film_database.favourites (
	user_id INT NOT NULL REFERENCES film_database.users(user_id),
	film_id INT NOT NULL REFERENCES film_database.films(film_id),
	PRIMARY KEY (user_id, film_id)
);