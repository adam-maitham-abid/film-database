import styles from "./Toast.module.css"

import { useState, useEffect } from "react";

export default () => {
	const [text, setText] = useState("Default text");

	useEffect(() => {

	}, [text]);

	function show(text) {
		setText(text);
	}

	return (
		<div class={styles.toast + " " + styles.toastShown}>{text}</div>
	);
};