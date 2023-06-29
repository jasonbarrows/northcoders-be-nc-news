const express = require('express');
const { getAllCommentsByArticleId, createCommentbyArticleId } = require('../controllers/article-comments.controllers');

const articleCommentsRouter = express.Router({ mergeParams: true });

articleCommentsRouter.get('/', getAllCommentsByArticleId);
articleCommentsRouter.post('/', express.json(), createCommentbyArticleId);

module.exports = articleCommentsRouter;
