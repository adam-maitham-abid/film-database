import { useEffect, useState } from "react";
import styles from "./Lists.module.css"
import axios from "axios";
import Navigation from "../components/Navigation";
import Film from "../components/Film";

export default ({ auth }) => {
	const [lists, setLists] = useState();
	const [searching, setSearching] = useState(false);
	const [results, setResults] = useState();
	const [selected, setSelected] = useState(null);

	useEffect(() => {
		(async () => {
			getLists();
		})();
	},[]);

	const getLists = async () => {
		await axios.get("http://localhost:3001" + "/lists?include_films=true", { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(response => (setLists(response.data), console.log(response.data)))
			.catch(error => console.log(error));
	}

	const createList = async (listName) => {
		await axios.push("http://localhost:3001" + "/lists", { listName: listName }, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(response => console.log(response))
			.catch(error => console.log(error));
		getLists();
	};

	const deleteList = async (listId) => {
		await axios.delete("http://localhost:3001" + "/lists/" + listId, { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(response => console.log(response))
			.catch(error => console.log(error));
		getLists();
	}

	const addToList = async (film) => {
		lists[selected]?.films?.push(film);
	};

	const search = async (event) => {
		const query = event.target.value;
		if (query && query.length > 1) {
			await axios.get("http://localhost:3001/search?title=" + query)
				.then(response => setResults(response.data.rows))
				.catch(error => console.log(error));
		}
		else {
			setResults(null);
		}
	}

	return <>
		<Navigation auth={auth}/>
		<div className={styles.scroll}>
			{ lists?.map((list, index) => (
				<div className={styles.list} key={index}>
					<h3>{list.list_name} <input className={styles.h3} defaultValue={list.list_name}/> <span><button onClick={() => (setSelected(index), setSearching(true))}>ADD</button> <button>RENAME</button> <button onClick={() => deleteList(list.list_id)}>DELETE</button></span></h3>
					{ list?.films?.map((film, index) => (
						<Film className={styles.listEntry} key={index} title={film?.title} cover={film?.cover} id={film?.film_id}/>
					)) }
				</div>
			)) }
			{ searching &&
				<>
					<div class={styles.overlay}/>
					<div class={styles.addBox}>
						<button onClick={() => setSearching(false)}>CLOSE</button>
						<input class={styles.addSearch} type="text" placeholder="Add a movie to your list..." onChange={search}/>
						{(results?.length > 0) ? results.slice(0, 8).map((item, index) => (
							<a onClick={() => addToList(item)} key={index}>
								<div className={styles.result}>
									<img src={"https://image.tmdb.org/t/p/w94_and_h141_bestv2/" + item.cover} width={55}></img>
									<div className={styles.resultInfo}>
										<div className={styles.resultTitle}>{item.title}</div>
										<div className={styles.synopsis}>{item.synopsis}</div>
									</div>
								</div>
							</a>
						)) :
						<div className={styles.noResults}>No results found for your query.</div>}
					</div>
				</>
			}
		</div>
	</>;
};