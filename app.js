const express = require('express');
const { getAllEndpoints } = require('./controllers/api.controllers');
const { getAllArticles, getArticleById, editArticleById } = require('./controllers/articles.controllers');
const { getAllCommentsByArticleId, createCommentbyArticleId } = require('./controllers/article-comments.controllers');
const { destroyCommentById } = require('./controllers/comments.controllers');
const { getAllTopics } = require('./controllers/topics.controllers');
const { getAllUsers } = require('./controllers/users.controllers');
const { handleCustomErrors, handlePsqlErrors, handleServerErrors } = require('./errors');

const app = express();

app.get('/api', getAllEndpoints);

app.get('/api/articles', getAllArticles);
app.get('/api/articles/:article_id', getArticleById);
app.patch('/api/articles/:article_id', express.json(), editArticleById);

app.get('/api/articles/:article_id/comments', getAllCommentsByArticleId);
app.post('/api/articles/:article_id/comments', express.json(), createCommentbyArticleId);

app.delete('/api/comments/:comment_id', destroyCommentById);

app.get('/api/topics', getAllTopics);

app.get('/api/users', getAllUsers);

app.get('*', (_, res) => {
  res.status(404).send({ message: 'Not found' });
})

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
