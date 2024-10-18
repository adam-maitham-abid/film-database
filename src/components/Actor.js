import { useState, useEffect } from 'react';
import styles from './Actor.module.css';

export default ({ name, picture }) => (
	<div className={styles.card}>
		<img className={styles.picture} src={picture}/>
		<div className={styles.name}>{name}</div>
	</div>
);