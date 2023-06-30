const format = require('pg-format');
const db = require('../db/connection');

exports.selectAllTopics = () => {
  return db.query(
    `SELECT * FROM topics;`
  ).then(({ rows }) => {
    return rows;
  });
};

exports.insertTopic = ({ slug, description }) => {
  const newTopic = { slug };
  if (description) newTopic.description = description;

  const queryData = [
    Object.keys(newTopic).map(key => format('%I', key)).join(', '),
    Object.values(newTopic).map(value => format('%L', value)).join(', '),
  ];

  return db.query(format(
    `INSERT INTO topics (%s) VALUES (%s)
    RETURNING *;`,
    ...queryData
  )).then(({ rows }) => {
    return rows[0];
  })
};

exports.checkTopicSlugExists = (topic) => {
  return db.query(`SELECT * FROM topics WHERE slug = $1;`, [
    topic
  ]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: 'Topic not found'});
    }
  });
};
