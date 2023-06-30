const format = require('pg-format');
const db = require('../db/connection');
const { checkTopicSlugExists } = require('./topics.models');

exports.selectAllArticles = ({
  topic,
  sort_by = 'created_at',
  order = 'desc',
  limit = 10,
  p: page,
  total_count
}) => {
  // if (limit === '') limit = 10;

  const validSortByOptions = [
    'article_id',
    'title',
    'topic',
    'author',
    'created_at',
    'votes',
    'article_img_url',
    'comment_count'
  ];

  if (!validSortByOptions.includes(sort_by)) {
    return Promise.reject({ status: 400, message: 'Invalid sort_by query' });
  }

  if (!['asc', 'desc'].includes(order.toLowerCase())) {
    return Promise.reject({ status: 400, message: 'Invalid order query' });
  }

  if (limit % 1 !== 0) {
    return Promise.reject({ status: 400, message: 'Invalid limit query' });
  }

  const queryValues = [];

  let queryStr = `SELECT a.article_id, a.title, a.topic, a.author, a.created_at, a.votes, a.article_img_url, CAST (COUNT (c.comment_id) AS INTEGER) AS comment_count`;

  if (total_count === '') {
    queryStr += `, CAST (count(a.article_id) OVER() AS INTEGER) AS total_count`;
  }

  queryStr += ` FROM articles a LEFT JOIN comments c ON c.article_id = a.article_id`;

  if (topic) {
    queryValues.push(topic);
    queryStr += ` WHERE topic = $${queryValues.length}`;
  }

  queryStr += ` GROUP BY a.article_id ORDER BY ${sort_by} ${order.toUpperCase()}`;

  if (limit) {
    queryValues.push(limit);
    queryStr += ` LIMIT $${queryValues.length}`;
  }

  if (page) {
    queryValues.push((page - 1) * limit);
    queryStr += ` OFFSET $${queryValues.length}`;
  }

  queryStr += ';';

  const promises = [
    db.query(queryStr, queryValues),
  ];

  if (topic) {
    promises.push(checkTopicSlugExists(topic));
  }

  return Promise.all(promises).then((result) => {
    return result[0].rows
  });
};

exports.selectArticleById = (article_id) => {
  return db.query(
    `SELECT a.*, CAST (COUNT (c.comment_id) AS INTEGER) AS comment_count
    FROM articles a
    LEFT JOIN comments c ON c.article_id = a.article_id
    WHERE a.article_id = $1
    GROUP BY a.article_id;`, [
    article_id
  ]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: 'Not found' });
    }
    return rows[0];
  });
};

exports.selectAllCommentsByArticleId = (article_id, { limit = 10, p: page }) => {
  if (limit % 1 !== 0) {
    return Promise.reject({ status: 400, message: 'Invalid limit query' });
  }

  const queryValues = [ article_id ];
  let queryStr = `SELECT c.* FROM comments c JOIN articles a ON a.article_id = c.article_id WHERE a.article_id = $1 ORDER BY created_at DESC`;

  if (limit) {
    queryValues.push(limit);
    queryStr += ` LIMIT $${queryValues.length}`;
  }

  if (page) {
    queryValues.push((page - 1) * limit);
    queryStr += ` OFFSET $${queryValues.length}`;
  }

  return Promise.all([
    db.query(queryStr, queryValues),
    this.selectArticleById(article_id),
  ]).then(([result]) => {
    return result.rows;
  });
};

exports.insertArticle = (body) => {
  const preparedArticle = {
    title: body.title,
    topic: body.topic,
    author: body.author,
    body: body.body,
  };

  if (body.article_img_url) {
    preparedArticle.article_img_url = body.article_img_url;
  }

  const keys = Object.keys(preparedArticle).map(key => {
    return format('%I', key);
  }).join(', ');

  const values = Object.values(preparedArticle).map(value => {
    return format('%L', value);
  }).join(', ');

  return db.query(format(
    `INSERT INTO articles (%s) VALUES (%s)
    RETURNING *, 0 AS comment_count;`,
    keys,
    values
  )).then(({ rows }) => {
    return rows[0];
  });
};

exports.updateArticleById = (article_id, { inc_votes }) => {
  return db.query(
    `UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;`, [
      inc_votes,
      article_id,
    ]
  ).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: 'Not found'});
    }
    return rows[0];
  });
};

exports.deleteArticleById = (article_id) => {
  return db.query(`DELETE FROM comments WHERE article_id = $1;`, [
    article_id,
  ]).then(() => {
    return db.query(
      `DELETE FROM articles
      WHERE article_id = $1
      RETURNING *;`, [
        article_id,
      ]
    );
  }).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: 'Not found' });
    }
  });
};
