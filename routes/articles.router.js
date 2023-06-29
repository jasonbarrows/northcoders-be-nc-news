const express = require('express')
const { getAllArticles, getArticleById, editArticleById } = require('../controllers/articles.controllers');
const articleCommentsRouter = require('./article-comments.router');

const articlesRouter = express.Router();

articlesRouter.get('/', getAllArticles);
articlesRouter.get('/:article_id', getArticleById);
articlesRouter.patch('/:article_id', express.json(), editArticleById);

articlesRouter.use('/:article_id/comments', articleCommentsRouter);

module.exports = articlesRouter;