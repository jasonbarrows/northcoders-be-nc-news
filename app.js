const express = require('express');
const { getAllEndpoints } = require('./controllers/api.controllers');
const { getAllTopics } = require('./controllers/topics.controllers');
const { getArticleById } = require('./controllers/articles.controller');
const { handleServerErrors, handlePsqlErrors, handleCustomErrors } = require('./errors');

const app = express();

app.get('/api', getAllEndpoints);
app.get('/api/topics', getAllTopics);

app.get('/api/articles/:article_id', getArticleById);

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
