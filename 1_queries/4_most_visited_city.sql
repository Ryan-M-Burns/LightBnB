-- SELECT city, count(reservations.*) AS total_reservations
-- FROM reservations
-- JOIN properties ON properties.id = property_id
-- GROUP BY city
-- ORDER BY count(reservations.*) DESC;

SELECT properties.city, count(reservations) as total_reservations
FROM reservations
JOIN properties ON property_id = properties.id
GROUP BY properties.city
ORDER BY total_reservations DESC;