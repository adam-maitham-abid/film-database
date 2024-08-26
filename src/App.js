import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Search from './pages/Search';
import FilmDetails from './pages/FilmDetails';
import PageNotFound from './pages/PageNotFound';
import Favourites from './pages/Favourites';

import Account from './pages/Account';

import axios from 'axios';

import { useState, useContext, useEffect } from 'react';
import Home from './pages/Home';

export default () => {
	const [auth, setAuth] = useState(null);

	useEffect(() => {
		axios.get("http://localhost:3001/auth")
			.then(response => {
				if (response.data === false) {
					localStorage.setItem("authToken", null);
					setAuth(null);
				}
			})
			.catch(error => console.log(error));
	}, []);

	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home/>}/>
				<Route path="/search" element={<Search/>}/>
				<Route path="/movies/:id" element={<FilmDetails/>}/>
				<Route path="/favourites" element={<Favourites/>}/>
				<Route path="/account" element={<Account/>}/>
				<Route path="*" element={<PageNotFound/>}/>
			</Routes>
		</Router>
	);
}