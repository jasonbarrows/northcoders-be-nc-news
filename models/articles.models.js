const db = require('../db/connection');

exports.selectAllArticles = () => {
  return db.query(
    `SELECT a.article_id, a.title, a.topic, a.author, a.created_at, a.votes, a.article_img_url, CAST (COUNT (c.comment_id) AS INTEGER) AS comment_count
    FROM articles a
    LEFT JOIN comments c ON c.article_id = a.article_id
    GROUP BY a.article_id
    ORDER BY created_at DESC;`
  ).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [
    article_id
  ]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: 'Not Found' });
    }
    return rows[0];
  });
};

exports.selectAllCommentsByArticleId = (article_id) => {
  return Promise.all([
    db.query(
      `SELECT c.* FROM comments c
      JOIN articles a ON a.article_id = c.article_id
      WHERE a.article_id = $1;`, [
        article_id,
      ]
    ),
    this.selectArticleById(article_id),
  ]).then(([result]) => {
    return result.rows;
  });
};

exports.updateArticleById = (article_id, { inc_votes }) => {
  return db.query(
    `UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *`, [
      inc_votes,
      article_id,
    ]
  ).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: 'Not Found'});
    }
    return rows[0];
  });
};
