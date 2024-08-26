import { useState, useEffect } from "react";

import styles from "./Navigation.module.css"

import axios from "axios";

import { useNavigate } from "react-router-dom";

export default ({onChange = null, defaultValue = null}) => {
	const navigate = useNavigate();

	const [query, setQuery] = useState("");
	const [results, setResults] = useState(null);
	const [profileDropdown, setProfileDropdown] = useState(false);

	if (typeof onChange !== "function") {
		onChange = (event) => { setQuery(event.target.value); }
	}

	useEffect(() => {
		if (query && query.length > 1) {
			axios.get("http://localhost:3001/search?title=" + query)
				.then(response => {
					console.log(response);
					setResults(response.data.rows);
				})
				.catch(error => console.log(error));
		}
		else {
			setResults(null);
		}
	}, [query]);

	function properSearch(event) {
		if (event.keyCode === 13) {
			navigate("/search?query=" + query);
		}
	}
	
	return (
		<nav className={styles.navigation}>
			<input className={styles.searchField} onKeyDown={properSearch} type="text" placeholder="Search for a movie..." defaultValue={defaultValue} onChange={onChange}/>
			<button className={styles.searchButton}>&#x1F50D;&#xFE0E;</button>
			<a className={styles.profile} onClick={() => setProfileDropdown(!profileDropdown)}>P</a>
			{ profileDropdown ?
				<div className={styles.account}>
					<a className={styles.accountLink} href="/account">Account</a>
					{ localStorage.getItem("authToken") !== null ? <div>
						<a className={styles.accountLink} href="/favourites">Favourites</a>
						<a className={styles.accountLink} onClick={() => localStorage.removeItem("authToken")} href="/">Log out</a>
					</div> : null }
				</div>
			: null }
			{ results ? 
				<div className={styles.searchResults}>
					<div>
						{results?.slice(0, 8).map(item => (
							<a href={"/movies/" + item.film_id}>
								<div className={styles.result}>
									<img src={"https://image.tmdb.org/t/p/w94_and_h141_bestv2/" + item.cover} width={50}></img>
									<div className={styles.resultInfo}>
										<div className={styles.resultTitle}>{item.title}</div>
										<div className={styles.synopsis}>{item.synopsis}</div>
									</div>
								</div>
							</a>
						))}
					</div>
				</div>
			: null }
		</nav>
	);
};