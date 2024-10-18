import { useEffect, useState, useRef } from 'react';
import styles from './Carousel.module.css'
import Film from './Film';

export default ({ items }) => {
	const [rotation, setRotation] = useState(0);
	const [timeoutDelay, setTimeoutDelay] = useState(0);
	const rotationRef = useRef(rotation);
	const timeoutRef = useRef(null);

	async function next() {
		if (rotationRef.current + 1 >= items?.length) setRotation(0);
		else setRotation(rotationRef.current + 1);
	}

	const setRotationAndExtendTimeout = (rotation, timeout) => {
		setTimeoutDelay(timeout);
		clearTimeout(timeoutRef.current);
		setRotation(rotation);
	};

	useEffect(() => {
		rotationRef.current = rotation;
		timeoutRef.current = setTimeout(next, 5000 + timeoutDelay);
		setTimeoutDelay(0);
	}, [rotation]);

	useEffect(() => {
		timeoutRef.current = setTimeout(next, 5000);
		return () => clearInterval(timeoutRef.current);
	}, []);

	return (
		<div className={styles.carousel}>
			{ items && <div>
				<img className={styles.backdrop} src={"https://image.tmdb.org/t/p/original" + items[rotation].backdrop}/>
				<div className={styles.container}>
					<a href={"http://localhost:3002/movies/" + items[rotation].film_id}><img className={styles.cover} src={"https://image.tmdb.org/t/p/w400" + items[rotation].cover} alt={items[rotation].title}/></a>
					<div className={styles.info}>
						<h2>{items[rotation].title}</h2>
						<br/>
						<p>{items[rotation].synopsis}</p>
					</div>
				</div>
				<div className={styles.dots}>
					{ items?.map((item, index) => <div className={rotation === index ? styles.currentDot : styles.dot} onClick={() => setRotationAndExtendTimeout(index, 5000)}/>) }
				</div>
			</div> }
		</div>
	);
};