import { useState, useEffect } from "react";
import axios from "axios";

import Film from "../components/Film";
import Navigation from "../components/Navigation";

import styles from './Favourites.module.css'

export default () => {
	const [favourites, setFavourites] = useState(null);

	useEffect(() => {
		axios.get("http://localhost:3001/favourites", { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(response => { getMovieData(response.data); })
			.catch(error => console.log(error));

		async function getMovieData(response) {
			let movies = [];
			for (let i = 0; i < response.length; i++) {
				await axios.get(`http://localhost:3001/movies/${response[i].film_id}`)
					.then(response => {
						console.log(response);
						movies.push({ "id": response.data.film_id, "title": response.data.title, "cover": response.data.cover })
					})
					.catch(error => console.log(error));
				setFavourites(movies);
			}
		}
	}, []);

	return (
		<div>
			<Navigation/>
			<div className={styles.container}>
				<h1>Favourites</h1>
				{ favourites?.map(item => (<Film key={item.id} title={item.title} id={item.id} cover={item.cover}/>)) }
			</div>
		</div>
	);
}