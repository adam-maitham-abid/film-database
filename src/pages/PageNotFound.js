import styles from "./PageNotFound.module.css"

export default ({ auth }) => (
	<div className={styles.container}>
		<div>
			<h1 className={styles.h1}>404</h1>
			<h2 className={styles.h2}>Page Not Found</h2>
		</div>
	</div>
);