import { useState, useEffect } from "react";
import axios from "axios";

import Film from "../components/Film";
import Navigation from "../components/Navigation";

import styles from './Favourites.module.css'

export default ({ auth }) => {
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
			<Navigation auth={auth}/>
			<div className={styles.container}>
				<h1>Favourites</h1>
				{ favourites && favourites.length > 0 ? favourites.map(item => (<Film key={item.id} title={item.title} id={item.id} cover={item.cover}/>)) : <div>No favourites have been added to your list yet. Look at some movies and you can add them to your list via the star icon.</div> }
			</div>
		</div>
	);
};