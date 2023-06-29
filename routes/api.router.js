const express = require('express');
const { getAllEndpoints } = require('../controllers/api.controllers');
const articlesRouter = require('./articles.router');
const commentsRouter = require('./comments.router');
const topicsRouter = require('./topics.router');
const usersRouter = require('./users.router');

const apiRouter = express.Router();

apiRouter.get('/', getAllEndpoints);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
