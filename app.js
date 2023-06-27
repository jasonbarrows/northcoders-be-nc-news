const express = require('express');
const { getAllEndpoints } = require('./controllers/api.controllers');
const { getAllArticles, getArticleById } = require('./controllers/articles.controllers');
const { getAllCommentsByArticleId } = require('./controllers/article-comments.controllers');
const { getAllTopics } = require('./controllers/topics.controllers');
const { handleCustomErrors, handlePsqlErrors, handleServerErrors } = require('./errors');

const app = express();

app.get('/api', getAllEndpoints);

app.get('/api/articles', getAllArticles);
app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles/:article_id/comments', getAllCommentsByArticleId);

app.get('/api/topics', getAllTopics);

app.get('*', (_, res) => {
  res.status(404).send({ message: 'Not Found' });
})

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
