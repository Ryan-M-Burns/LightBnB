const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const queryString = `
    SELECT *
    FROM users
    WHERE email = $1
    `;
  const values = [email];

  return pool.query(queryString, values)
    .then(res => {
      if (res.rows.length) {
        return res.rows[0];
      }
      return null;
    })
    .catch(err => console.error(err));

};

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const queryString = `
    SELECT *
    FROM users
    WHERE id = $1
    `;
  const values = [id];

  return pool.query(queryString, values)
    .then(res => {
      if (res.rows.length) {
        return res.rows[0];
      }
      return null;
    })
    .catch(err => console.error(err));

};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  const queryString = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
    `;
  const values = [user.name, user.email, user.password];

  return pool.query(queryString, values)
    .then(res => {
      console.log('res.rows', res.rows, 'res.rows[0]', res.rows[0]);
      return res.rows[0];
    })
    .catch(() => null);

};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const queryString = `
    SELECT reservations.id, properties.*, reservations.start_date, avg(rating) as average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;`;
  const values = [guest_id, limit];

  return pool
    .query(queryString, values)
    .then(res => res.rows)
    .catch(err => console.error(err));

};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  console.log('options:', options);
  const queryParams = [];

  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;
  Object.keys(options).forEach(key => {
    console.log(key);

    if (options[key]) {
      
      if (queryParams[0]) {
        queryString += 'AND ';
      }

      if (key === 'city') {
        queryParams.push(`%${options.city}%`);
        queryString += `WHERE city LIKE $${queryParams.length} `;
      }

      if (key === 'owner_id') {
        queryParams.push(`${options.owner_id}`);
        queryString += `WHERE owner_id = $${queryParams.length} `;
      }

      if (key === 'minimum_price_per_night') {
        queryParams.push(`${options.minimum_price_per_night * 100}`);
        queryString += `WHERE minimum_price_per_night <= $${queryParams.length} `;
      }

      if (key === 'maximum_price_per_night') {
        queryParams.push(`${options.maximum_price_per_night * 100}`);
        queryString += `WHERE maximum_price_per_night >= $${queryParams.length} `;
      }

      if (key === 'minimum_rating') {
        queryParams.push(`${options.minimum_rating}`);
        queryString += `WHERE minimumm_rating >= $${queryParams.length} `;
      }
    }
  });

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  console.log(queryString, queryParams);

  return pool
    .query(queryString, queryParams)
    .then(res => {
      return res.rows;
    })
    .catch(err => console.error(err));
};

exports.getAllProperties = getAllProperties;



/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

exports.addProperty = addProperty;