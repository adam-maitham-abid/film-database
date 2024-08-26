import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from "./FilmDetails.module.css"

import axios from 'axios';
import Navigation from '../components/Navigation';

export default () => {
	const { id } = useParams();
	const [favourited, setFavourited] = useState(false);
	const [data, setData] = useState(null);
	const [genres, setGenres] = useState(null);

	useEffect(() => {
		axios.get("http://localhost:3001/genres")
			.then(response => setGenres(response?.data?.rows))
			.catch(error => console.log(error));
		axios.get("http://localhost:3001/movies/" + id)
			.then(async response => { setData(await response.data); console.log(response.data)})
			.catch(error => console.log(error));
		axios.post("http://localhost:3001/favourited", { film_id: id }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(response => setFavourited(response?.data != ""))
			.catch(error => console.log(error));
	}, []);

	function favourite() {
		setFavourited(true);
		axios.post("http://localhost:3001/favourite", { film_id: id }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.catch(error => console.log(error));
	}

	function unfavourite() {
		setFavourited(false);
		axios.post("http://localhost:3001/unfavourite", { film_id: id }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.catch(error => console.log(error));
	}

	return (
		<div>
			<Navigation/>
			<img className={styles.backdrop} src={"https://image.tmdb.org/t/p/original/" + data?.backdrop}></img>
			<div className={styles.container}>
				<img className={styles.poster} src={"https://image.tmdb.org/t/p/original/" + data?.cover}></img>
				<div className={styles.information}>
					<h1>{data?.title}<span className={styles.right}>{ favourited ? <button className={styles.favourite} onClick={unfavourite}><div className={styles.icon}>&#9733;</div></button> : <button className={styles.favourite} onClick={favourite}><div className={styles.icon}>&#9734;</div></button> }</span></h1>
					<div className={styles.metaInfo}>User Rating: {data?.rating?.toFixed(2)} Year: {data?.release_date?.substr(0, 4)}</div>
					{ data?.tagline ? <div className={styles.tagLine}>"{data.tagline}"</div> : <br/> }
					<div>{data?.synopsis}</div>
					<br/>
					<div>Genres: {data?.genres.map(item => genres[Number(item) - 1]?.genre_name).join(", ")}</div>
				</div>
			</div>
		</div>
	)
}