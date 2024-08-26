SELECT f.*
FROM film_database.films f
WHERE f.film_id IN (
	SELECT fg.film_id
	FROM film_database.film_genres fg
	WHERE fg.genre_id = ANY(ARRAY[1, 2])
	GROUP BY fg.film_id
	HAVING COUNT (DISTINCT fg.genre_id) = 2
)
AND f.film_id NOT IN (
	SELECT fg.film_id
	FROM film_database.film_genres fg
	WHERE fg.genre_id = ANY(ARRAY[3, 6])
	GROUP BY fg.film_id
)
ORDER BY f.film_id;