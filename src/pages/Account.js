import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import styles from "./Account.module.css"

export default () => {
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const [invalidCredentials, setInvalidCredentials] = useState(false);

	const [creatingAccount, setCreatingAccount] = useState(false);
	
	const [constraintUsernameAvailable, setUsernameAvailable] = useState(true);
	const [constraintLength, setConstraintLength] = useState(true);
	const [constraintUppercaseLowercase, setConstraintUppercaseLowercase] = useState(true);
	const [constraintSpecialCharacter, setConstraintSpecialCharacter] = useState(true);
	const [constraintNumber, setConstraintNumber] = useState(true);

	const regexSpecialCharacter = new RegExp(/[ `!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?~]/);
	const regexUppercaseLowercase = new RegExp(/(?=.*[A-Z])(?=.*[a-z])/);
	const regexNumber = new RegExp(/[0-9]/);

	const inputUsername = event => { setUsername(event.target.value); }
	const inputPassword = event => { setPassword(event.target.value); validate(event.target.value); }

	const submit = async event => {
		event.preventDefault();
		await axios.post((creatingAccount ? "http://localhost:3001/users/create" : "http://localhost:3001/login"), { username: username, password: password })
			.then(response => {
				console.log(response);
				localStorage.setItem("authToken", response.data.authToken);
				navigate("/");
			})
			.catch(error => {
				console.log(error);
				if (error.response.status === 403) {
					if (error.response.data.error === "Username is taken") {
						setUsernameAvailable(false);
						console.log("Username is taken");
					}
				}
				if (error.response.status === 401) {
					if (error.response.data.error === "Invalid credentials") {
						setInvalidCredentials(true);
						console.log("Invalid credentials");
					}
				}
			});
	};

	const validate = password => {
		setConstraintLength(password.length >= 8);
		setConstraintUppercaseLowercase(regexUppercaseLowercase.test(password));
		setConstraintSpecialCharacter(regexSpecialCharacter.test(password));
		setConstraintNumber(regexNumber.test(password));
	};

	useEffect(() => {
		axios.get("http://localhost:3001/user", { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } })
			.then(response => {
				if (response.status == 200) {
					navigate("/");
				}
			})
			.catch(error => console.log(error));
	}, []);

	return (
		<div>
			<form className={styles.form} onSubmit={submit} autoComplete="on">
				{ invalidCredentials && !creatingAccount ? <h3 className={styles.constraint}>Invalid credentails.</h3> : null }
				<label className={styles.label} htmlFor="username">Username</label>
				<input className={styles.input} id="username" type="text" onChange={inputUsername}></input>
				<ul>
					{ !constraintUsernameAvailable ? <li className={styles.constraint}>Username is Taken</li> : null }
				</ul>
				<label className={styles.label} htmlFor="password">Password</label>
				<input className={styles.input} id="password" type="password" onChange={inputPassword}></input>
				{
					creatingAccount ?
					<ul>
						{ !constraintLength ? <li className={styles.constraint}>Password must contain at least 8 characters.</li> : null }
						{ !constraintUppercaseLowercase ? <li className={styles.constraint}>Password must contain an uppercase and lowercase letter.</li> : null }
						{ !constraintSpecialCharacter ? <li className={styles.constraint}>Password must contain at least one special character.</li> : null }
						{ !constraintNumber ? <li className={styles.constraint}>Password must contain at least one number.</li> : null }
					</ul>
					: null
				}
				<button className={styles.submit} type="submit">{ creatingAccount ? "Sign up" : "Log in" }</button>
				{ creatingAccount ? <a className={styles.hyperlink} onClick={() => setCreatingAccount(false)}>Use an existing account</a> : <a className={styles.hyperlink} onClick={() => setCreatingAccount(true)}>Create an account</a> }
			</form>
		</div>
	);
};