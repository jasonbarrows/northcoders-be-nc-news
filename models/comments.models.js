const db = require('../db/connection');
const { selectArticleById } = require('./articles.models');

exports.insertCommentByArticleId = (article_id, { username, body }) => {
  const preparedComment = [
    article_id,
    username,
    body,
  ];

  return selectArticleById(article_id).then(() => {
    return db.query(
      `INSERT INTO comments (article_id, author, body)
      VALUES ($1, $2, $3)
      RETURNING *;`,
      preparedComment
    ).then(({ rows }) => {
      return rows[0];
    });
  });
};

exports.updateCommentById = (comment_id, { inc_votes }) => {
  return db.query(
    `UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *;`, [
      inc_votes,
      comment_id,
    ]
  ).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: 'Not found' });
    }
    return rows[0];
  });
};

exports.deleteCommentById = (comment_id) => {
  return db.query(
    `DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *;`, [
      comment_id,
    ]
  ).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: 'Not found' });
    }
  });
};
