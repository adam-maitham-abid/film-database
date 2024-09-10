import { useState, useEffect } from 'react';

import axios from 'axios';
import Navigation from '../components/Navigation';

import styles from './Home.module.css'

import Film from '../components/Film.js'
import Carousel from '../components/Carousel';

export default ({ auth }) => {
	const [user, setUser] = useState(null);
	const [favourites, setFavourites] = useState(null);
	const [carouselItems, setCarouselItems] = useState(null);

	useEffect(() => { (async () => {
		await axios.get("http://localhost:3001/search?title=")
			.then(response => setCarouselItems(response?.data?.rows.slice(0, 7)))
			.catch(error => console.log(error));
		await axios.get("http://localhost:3001/user", { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(response => setUser(response.data))
			.catch(error => console.log(error));
		await axios.get("http://localhost:3001/favourites", { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(async response => await getMovies(response.data))
			.catch(error => console.log(error));
		async function getMovies(data) {
			let movies = [];
			for (let i = 0; i < data.length; i++) {
				await axios.get(`http://localhost:3001/movies/${data[i].film_id}`)
					.then(response => {
						console.log(response);
						movies.push({ "id": response.data.film_id, "title": response.data.title, "cover": response.data.cover })
					})
					.catch(error => console.log(error));
				setFavourites(movies);
			}
		}
	})();},[]);

	return (
		<>
			<Navigation auth={auth}/>
			<div className={styles.scroll}>
				<Carousel items={carouselItems}/>
				<div className={styles.container}>
					{ user ? (<h1>Welcome back, {user?.username}!</h1>) : (<h1>Welcome, Guest!</h1>) }
					<div className={styles.favourites}>
						<h2>Your Favourites</h2>
						{ favourites?.map(item => <Film id={item.id} title={item.title} cover={item.cover}/>) }
					</div>
				</div>
			</div>
		</>
	);
};