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