const { selectAllCommentsByArticleId } = require("../models/articles.models");
const { insertCommentByArticleId } = require("../models/comments.models");

exports.getAllCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  selectAllCommentsByArticleId(article_id).then((comments) => {
    res.status(200).send({ comments });
  }).catch(next);
};

exports.createCommentbyArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const comment = req.body;

  insertCommentByArticleId(article_id, comment).then((insertedComment) => {
    res.status(201).send({ comment: insertedComment });
  }).catch(next);
};
