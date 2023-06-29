const express = require('express');
const { destroyCommentById, editCommentById } = require('../controllers/comments.controllers');

const commentsRouter = express.Router();

commentsRouter.patch('/:comment_id', express.json(), editCommentById);
commentsRouter.delete('/:comment_id', destroyCommentById);

module.exports = commentsRouter;
