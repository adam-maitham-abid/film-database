import './App.css';

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Search from './pages/Search';
import FilmDetails from './pages/FilmDetails';
import PageNotFound from './pages/PageNotFound';
import Favourites from './pages/Favourites';

import Account from './pages/Account';

import axios from 'axios';

import { useState, useContext, useEffect } from 'react';
import Home from './pages/Home';
import Lists from './pages/Lists'
import Toast from './components/Toast';

export default () => {
	return (
		<Router>
			<Authenticator/>
		</Router>
	);
}

const Authenticator = () => {
	const [auth, setAuth] = useState(null);
	const location = useLocation();

	useEffect(() => {
		axios.get("http://localhost:3001/auth", { headers: { Authorization: `bearer ${localStorage.getItem("authToken")}` } })
			.then(response => {
				if (response.data === false) {
					localStorage.setItem("authToken", null);
					setAuth(null);
				}
				else {
					setAuth(response.data);
				}
			})
			.catch(error => console.log(error));
	}, [location]);

	return (
		<Routes>
			<Route path="/" element={<Home auth={auth}/>}/>
			<Route path="/search" element={<Search auth={auth}/>}/>
			<Route path="/movies/:id" element={<FilmDetails auth={auth}/>}/>
			<Route path="/favourites" element={<Favourites auth={auth}/>}/>
			<Route path="/account" element={<Account auth={auth}/>}/>
			<Route path="/lists" element={<Lists auth={auth}/>}/>
			<Route path="*" element={<PageNotFound auth={auth}/>}/>
		</Routes>
	)
}