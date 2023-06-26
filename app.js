const express = require('express');
const { getAllTopics } = require('./controllers/topics.controller');
const { handleServerErrors } = require('./errors');
const { getAllEndpoints } = require('./controllers/api.controllers');

const app = express();

app.get('/api', getAllEndpoints);
app.get('/api/topics', getAllTopics);

app.use(handleServerErrors);

module.exports = app;
