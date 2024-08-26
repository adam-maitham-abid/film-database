import { useState, useEffect } from 'react';

import axios from 'axios';
import Navigation from '../components/Navigation';

import styles from './Home.module.css'

export default () => {
	const [user, setUser] = useState(null);
	const [favourites, setFavourites] = useState(null);

	useEffect(() => { (async () => {
		await axios.get("http://localhost:3001/user", { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(response => setUser(response.data))
			.catch(error => console.log(error));
		await axios.get("http://localhost:3001/favourites", { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(response => setFavourites(response.data))
			.catch(error => console.log(error));
		let movies = [];
		for (let i = 0; i < favourites?.length; i++) {
			axios.get(`http://localhost:3001/movies/${favourites[i].film_id}`)
				.then(response => {
					console.log(response);
					movies.push({ "id": response.data.film_id, "title": response.data.title, "cover": response.data.cover })
				})
				.catch(error => console.log(error));
		}
		setFavourites(movies);
	})();},[]);

	return (
		<div>
			<Navigation/>
			<div className={styles.container}>
				{ user ? (<h1>Welcome back, {user?.username}!</h1>) : (<h1>Welcome, Guest!</h1>) }
			</div>
			<div className={styles.favourites}>
				{ favourites?.map(item => <p>{item.title}</p>) }
			</div>
			<div>
				<div>Check out what's currently popular.</div>
			</div>
		</div>
	);
}