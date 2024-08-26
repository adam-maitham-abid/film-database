const bcrypt = require("bcrypt");

const express = require("express");
const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
const cors = require("cors");
const { Client } = require("pg");

const axios = require("axios");

const secret = "bigsecret";

function authenticate(req, res) {
	try {
		const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
		console.log(token);

		if (token == null) return null;

		return jwt.verify(token, secret);
	}
	catch (error) {
		console.log(error);
		return null;
	}
}

const app = express();
// app.use(cookieParser());
const client = new Client({
	user: "postgres",
	host: "localhost",
	database: "postgres",
	password: "kake",
	port: 5432
});
client.connect();

const port = 3001;

app.use(cors({
	origin: "http://localhost:3002",
	credentials: true
}));


app.use(express.json());

app.get("/users", async (req, res) => {
	const { rows } = await client.query("SELECT * FROM film_database.users");
	res.json(rows);
});

app.get("/user", async (req, res) => {
	auth = authenticate(req, res);
	if (auth) {
		client.query("SELECT * FROM film_database.users WHERE user_id = $1", [ auth.user_id ])
			.then(response => res.status(200).json(response.rows[0]))
			.catch(error => res.status(500).send(error));
	}
	else {
		res.status(403).send();
	}
});

const regexSpecialCharacter = new RegExp(/[ `!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~]/);
const regexUppercaseLowercase = new RegExp(/(?=.*[A-Z])(?=.*[a-z])/);
const regexNumber = new RegExp(/[0-9]/);

app.post("/users/create", async (req, res) => {
	const { username, password } = req.body;
	console.log(req.body);

	if (password.length < 8
		|| !regexSpecialCharacter.test(password)
		|| !regexUppercaseLowercase.test(password)
		|| !regexNumber.test(password)
	) res.status(403).send("Invalid password");

	bcrypt.hash(password, 10, async (error, hash) => {
		try {
			await client.query(`INSERT INTO film_database.users (username, password) VALUES ('${username}', '${hash}') RETURNING user_id`)
				.then(result => {
					const row = result?.rows[0];
					console.log(result.rows);
					const token = jwt.sign({ user_id: row.user_id }, secret, { expiresIn: "168h" });
					res.status(200).json({ "authToken": token });
				});
		}
		catch (error) {
			if (error.code === '23505') res.status(403).send("Username is taken");
			console.log(error);
		}
	});
});

app.post("/favourite", async (req, res) => {
	const { film_id } = req.body;
	const authUser = authenticate(req, res);
	if (authUser) {
		const result = await client.query(`INSERT INTO film_database.favourites (user_id, film_id) VALUES ('${authUser.user_id}', '${film_id}')`)
			.catch(error => res.status(500).send(error));
	}
});

app.post("/unfavourite", async (req, res) => {
	const { film_id } = req.body;
	const authUser = authenticate(req, res);
	if (authUser) {
		await client.query(`DELETE FROM film_database.favourites WHERE user_id = ${authUser.user_id} AND film_id = ${film_id}`)
			.catch(error => res.status(500).send(error));
	}
});

app.post("/favourited", async (req, res) => {
	const { film_id } = req.body;
	const authUser = authenticate(req, res);
	if (authUser) {
		const result = await client.query(`SELECT * FROM film_database.favourites WHERE user_id = ${authUser.user_id} AND film_id = ${film_id}`)
			.catch(error => res.status(500).send(error));
		res.json(result.rows[0]);
	}
});

app.get("/favourites", async (req, res) => {
	console.log(req.headers.authorization);
	const auth = authenticate(req, res);
	if (auth) {
		await client.query(`SELECT * FROM film_database.favourites WHERE user_id = ${auth.user_id}`)
			.then(response => res.status(200).json(response.rows))
			.catch(error => console.log(error));
	}
});

app.listen(port, () => {
	console.log("Listening on port 3001");
});

app.post("/login", async (req, res) => {
	console.log("Request: POST /login");
	console.log(req.body);
	try {
		const { username, password } = req.body;
		console.log(username);
		console.log(password);
		const result = await client.query("SELECT * FROM film_database.users WHERE username = $1", [ username ]);
		const row = result?.rows[0];
		if (!row) {
			res.status(404).send({ error: "Account Not Found" });
		};
		console.log(row.password);
		bcrypt.compare(password, row.password, (error, result) => {
			console.log(result);
			if (error || !result) {
				res.status(401).send({ error: "Invalid credentials" });
			}
			else {
				const token = jwt.sign({ user_id: row.user_id }, secret, { expiresIn: "1h" });
				res.status(200).json({ "authToken": token });
			}
		});
	}
	catch (error) {
		console.log(error);
		res.status(500);
	}
});

app.get("/genres", async (req, res) => {
	console.log("Request: GET /genres");
	client.query("SELECT * FROM film_database.genres")
		.then(response => res.status(200).send(response))
		.catch(error => res.status(500).send(error));
});

app.get("/search", async (req, res) => {
	console.log("Request: GET /search");
	try {
		let title = "%" + req.query.title + "%";
		let include = req.query.include?.split(",");
		let exclude = req.query.exclude?.split(",");
		let sort = req.query.sort?.split(".");
		let badSort = false;
		if (sort?.length === 2)
		{
			if (sort[0] !== "rating" && sort[0] !== "release_date" && sort[0] !== "popularity") badSort = true;
			if (sort[1] !== "asc" && sort[1] !== "desc") badSort = true;
		}
		else {
			badSort = true;
		}
		if (badSort) {
			sort = [ "popularity", "desc" ];
		}
		sort[0] = "f." + sort[0];
		let query = `SELECT f.* FROM film_database.films f WHERE LOWER(f.title) LIKE LOWER($1) ${include?.length > 0 ? "AND f.film_id IN (SELECT fg.film_id FROM film_database.film_genres fg WHERE fg.genre_id = ANY(ARRAY[$3::INTEGER[]]) GROUP BY fg.film_id HAVING COUNT (DISTINCT fg.genre_id) = $4)" : ""} AND f.film_id NOT IN (SELECT fg.film_id FROM film_database.film_genres fg WHERE fg.genre_id = ANY(ARRAY[$2::INTEGER[]]) GROUP BY fg.film_id) ORDER BY ${sort.join(" ")};`;
		client.query(query, include?.length > 0 ? [ title, exclude, include, include.length ] : [ title, exclude ])
			.then(response => {
				res.status(200).send(response);
			})
			.catch(error => {
				console.log(error);
				res.status(500).send(error);
			});
	}
	catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

app.get("/movies/:id", async (req, res) => {
	console.log("Request: GET /movies/:id");
	try {
		const id = req.params.id;
		client.query("SELECT f.*, ARRAY_AGG(fg.genre_id) AS genres FROM film_database.films f LEFT JOIN film_database.film_genres fg ON f.film_id = fg.film_id WHERE f.film_id = $1 GROUP BY f.film_id", [ id ])
			.then(response => {
				res.status(200).send(response.rows[0]);
			})
			.catch(error => {
				console.log(error);
				res.status(500).send(error);
			});
	}
	catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});

// One-time use function to set up the initial database
app.get("/scrape", async (req, res) => {
	console.log("Request: GET /scrape");
	let mapping = [];
	await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=1660663c1dcbb2cd1b092f50e120b41b`)
		.then(response => {
			const genres = response.data.genres;
			for (var i = 0; i < genres.length; i++)
			{
				mapping[genres[i].id] = Number(i) + 1;
				client.query("INSERT INTO film_database.genres (genre_name) VALUES ($1)", [ genres[i].name ]);
			}
		})
		.catch(error => console.log(error));
	for (var i = 1; i < 51; i++)
	{
		await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=1660663c1dcbb2cd1b092f50e120b41b&sort_by=popularity.desc&page=${i}`)
			.then(response => {
				response.data.results.forEach(async result => {
					const response = await client.query("INSERT INTO film_database.films (title, cover, tagline, synopsis, backdrop, rating, popularity, release_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING film_id",
						[ result.title, result.poster_path, "", result.overview, result.backdrop_path, result.vote_average, result.popularity, result.release_date == "" ? null : result.release_date ]);
					console.log(result.genre_ids.map(id => mapping[id]));
					await client.query("WITH genres_to_insert AS (SELECT genre_id FROM film_database.genres WHERE genre_id = ANY($1::INTEGER[])) INSERT INTO film_database.film_genres (film_id, genre_id) SELECT $2, g.genre_id FROM genres_to_insert g",
						[ result.genre_ids.map(id => mapping[id]), response.rows[0].film_id ]);
				})
			})
			.catch(error => console.log(error));
		await new Promise(resolve => setTimeout(resolve, 250));
	}
	res.status(200).send();
});