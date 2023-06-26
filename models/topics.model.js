const db = require('../db/connection');

exports.selectAllTopics = () => {
  return db.query(
    `SELECT slug, description FROM topics;`
  ).then(({ rows }) => {
    return rows;
  });
};
