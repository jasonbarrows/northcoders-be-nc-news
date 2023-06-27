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
