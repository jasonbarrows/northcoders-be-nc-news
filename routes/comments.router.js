const express = require('express');
const { destroyCommentById } = require('../controllers/comments.controllers');

const commentsRouter = express.Router();

commentsRouter.delete('/:comment_id', destroyCommentById);

module.exports = commentsRouter;
