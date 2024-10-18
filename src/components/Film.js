import styles from './Film.module.css'

export default ({title, cover, id}) => (
	<a className={styles.container} href={"movies/" + id}>
		<img className={styles.cover} src={"https://image.tmdb.org/t/p/w400/" + cover} alt={title}/>
	</a>
);