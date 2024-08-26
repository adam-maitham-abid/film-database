import Film from '../components/Film';
import axios from 'axios';

import { useState, useEffect } from 'react';

import React from 'react';
import Navigation from '../components/Navigation';

import styles from './Search.module.css'

import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

const sortTypes = { "Rating Ascending": "rating.asc", "Rating Descending": "rating.desc", "Release Date Ascending": "release_date.asc", "Release Date Descending": "release_date.desc", "Popularity Ascending": "popularity.asc", "Popularity Descending": "popularity.desc" };

export default () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [query, setQuery] = useState(searchParams.get("query"));
	const [filters, setFilters] = useState({ include: [ ], exclude: [ ] });
	const [results, setResults] = useState(null);
	const [update, setUpdate] = useState(false);
	const [genres, setGenres] = useState(null);
	const [sort, setSort] = useState("popularity.desc");

	const [showSort, setShowSort] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	
	const navigate = useNavigate();
	const location = useLocation();

	const overrideSearch = (event) => {
		setQuery(event.target.value);
		const params = new URLSearchParams(location.search);
		params.set("query", event.target.value);
		navigate({ search: params.toString() }, { replace: true });
	}

	function filter(item)
	{
		const excludeIndex = filters.exclude.indexOf(item);
		const includeIndex = filters.include.indexOf(item);
		if (excludeIndex !== -1) {
			filters.exclude.splice(excludeIndex, 1);
		}
		else if (includeIndex !== -1) {
			filters.include.splice(includeIndex, 1);
			filters.exclude.push(item);
		}
		else {
			filters.include.push(item);
		}
		setUpdate(!update);
	}

	function toggleDropdown(dropdown) {
		if (dropdown === "filter") {
			setShowSort(false);
			setShowFilters(!showFilters);
		}
		else if (dropdown === "sort") {
			setShowFilters(false);
			setShowSort(!showSort);
		}
	};

	useEffect(() => {
		axios.get("http://localhost:3001/genres")
			.then(response => setGenres(response?.data?.rows))
			.catch(error => console.log(error));
	}, [])

	useEffect(() => {
		console.log(genres);
		console.log("http://localhost:3001/search?title=" + (query ?? "") + (filters.include.length > 0 ? ("&include=" + filters.include) : "") + (filters.exclude.length > 0 ? ("&exclude=" + filters.exclude) : "") + (sort ? "&sort=" + sort : ""));
		axios.get("http://localhost:3001/search?title=" + (query ?? "") + (filters.include.length > 0 ? ("&include=" + filters.include) : "") + (filters.exclude.length > 0 ? ("&exclude=" + filters.exclude) : "") + (sort ? "&sort=" + sort : ""))
			.then(response => {
				console.log(response);
				setResults(response.data.rows);
			})
			.catch(error => console.log(error));
	}, [query, sort, update]);

	return (
		<div>
			<Navigation onChange={overrideSearch} defaultValue={searchParams.get("query")}/>
			<div className={styles.page}>
				<div className={styles.filters}>
					<button className={styles.sortButton} onClick={() => toggleDropdown("sort")}>Sort</button>
					<button className={styles.sortButton} onClick={() => toggleDropdown("filter")}>Genres {filters.include.length > 0 ? <div className={styles.includeCount}>{filters.include.length}</div> : null } {filters.exclude.length > 0 ? <div className={styles.excludeCount}>{filters.exclude.length}</div> : null }</button>
					{ showSort ? (<div className={styles.sortMenu}>
						{ Object.keys(sortTypes).map(key => (
							<div className={(sort === sortTypes[key] ? styles.green : styles.default)} onClick={() => setSort(sortTypes[key])}>{key}</div>
						)) }
					</div>) : null }
					{ showFilters ? (<div className={styles.sortMenu}>
						{ Object.keys(genres).map(key => (
							<div className={(filters.include.indexOf(Number(key) + 1) !== -1 ? styles.green : (filters.exclude.indexOf(Number(key) + 1) !== -1 ? styles.red : styles.default))} key={key} onClick={() => filter(Number(key) + 1)}>{genres[key].genre_name}</div>
						)) }
					</div>) : null }
				</div>
				<div className={styles.results}>
					{ results?.map(item => (
						<Film id={item.film_id} title={item.title} cover={item.cover}/>
					)) }
				</div>
			</div>
		</div>
	);
}