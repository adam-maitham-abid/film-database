import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from "./FilmDetails.module.css"

import axios from 'axios';
import Navigation from '../components/Navigation';
import Actor from '../components/Actor';

export default ({ auth }) => {
	const { id } = useParams();
	const [favourited, setFavourited] = useState(false);
	const [data, setData] = useState(null);
	const [genres, setGenres] = useState(null);
	const [viewingLists, setViewingLists] = useState(false);
	const [lists, setLists] = useState([]);
	const [makingList, setMakingList] = useState(false);
	const [listsWithFilm, setListsWithFilm] = useState([]);

	async function updateListInfo() {
		await axios.get("http://localhost:3001/lists", { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(response => setLists(response?.data))
			.catch(error => console.log(error));
		await axios.get(`http://localhost:3001/list_films?film_id=${Number(id)}`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(response => (setListsWithFilm(response?.data?.map(list_film => list_film?.list_id)), console.log(response?.data)))
			.catch(error => console.log(error));
	}
	
	useEffect(() => {
		(async () => {
			updateListInfo();
			await axios.get("http://localhost:3001/genres")
				.then(response => setGenres(response?.data?.rows))
				.catch(error => console.log(error));
			await axios.get("http://localhost:3001/movies/" + id)
				.then(response => { setData(response?.data); console.log(response?.data)})
				.catch(error => console.log(error));
			await axios.get("http://localhost:3001/favourited?film_id=" + id, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
				.then(response => (setFavourited(response?.data !== ""), console.log("" + response)))
				.catch(error => console.log(error));
		})();
	}, []);

	async function createList(listName) {
		setMakingList(false);
		await axios.post("http://localhost:3001/lists", { listName: listName }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.catch(error => console.log(error));
		await axios.get("http://localhost:3001/lists", { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(response => setLists(response.data))
			.catch(error => console.log(error));
		updateListInfo();
	}

	async function favourite() {
		setFavourited(true);
		await axios.post("http://localhost:3001/favourite", { film_id: id }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.catch(error => (console.log(error), setFavourited(false)));
	}

	async function unfavourite() {
		setFavourited(false);
		await axios.post("http://localhost:3001/unfavourite", { film_id: id }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.catch(error => (console.log(error), setFavourited(true)));
	}

	const enlist = async (list_id) => {
		console.log("Enlisting:");
		console.log(list_id);
		console.log(Number(id));
		if (listsWithFilm.indexOf(list_id) === -1) {
			await axios.post("http://localhost:3001/list_films", { film_id: Number(id), list_id: list_id });
		}
		else {
			await axios.delete(`http://localhost:3001/list_films?film_id=${id}&list_id=${list_id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
		}
		updateListInfo();
	}

	return (
		<div>
			<Navigation auth={auth}/>
			<img className={styles.backdrop} src={"https://image.tmdb.org/t/p/original/" + data?.backdrop} alt=""></img>
			<div className={styles.container}>
				<img className={styles.poster} src={"https://image.tmdb.org/t/p/original/" + data?.cover} alt={"Cover image for " + data?.title}></img>
				<div className={styles.information}>
					<h1>{data?.title}<span className={styles.right}>{auth && <button onClick={() => setViewingLists(true)}>LISTS</button>}{ auth && (favourited ? <button className={styles.favourite} onClick={unfavourite}><div className={styles.icon}>&#9733;</div></button> : <button className={styles.favourite} onClick={favourite}><div className={styles.icon}>&#9734;</div></button>) }</span></h1>
					<div className={styles.metaInfo}>User Rating: {data?.rating?.toFixed(2)} Year: {data?.release_date?.substr(0, 4)}</div>
					{ data?.tagline ? <div className={styles.tagLine}>"{data?.tagline}"</div> : <br/> }
					<div className={styles.synopsis}>
						<div>{data?.synopsis}</div>
						<br/>
						<div>Genres: {data?.genres?.map((item, index) => (<><a className={styles.link} href={"/search?include=" + item}>{(genres[Number(item) - 1]?.genre_name)}</a>{ (index < data?.genres?.length - 1) && <>, </> }</>))}</div>
					</div>
					<div className={styles.bottom}>
						{ data?.actors?.map(actor => <Actor name={actor.name} picture={actor.picture}/>) }
					</div>
				</div>
			</div>
			{ viewingLists && <>
				<div className={styles.overlay}>
				</div>
				<div className={styles.listsContainer}>
					<h2>Film Lists<button className={styles.right} onClick={() => setViewingLists(false)}>CLOSE</button></h2>
					<br></br>
					<div className={styles.scroller}>
						{ lists?.map(list => <label className={styles.list}>{list.list_name}<input className={styles.right} type="checkbox" defaultChecked={listsWithFilm.indexOf(list.list_id) !== -1} onClick={() => enlist(list.list_id)}></input></label>) }
					</div>
					{ makingList && <input className={styles.list} onKeyDown={e => e.keyCode === 13 && createList(e.target.value)}></input> }
					<button onClick={() => setMakingList(true)}>NEW LIST</button>
					<br></br>
				</div>
			</> }
		</div>
	);
};