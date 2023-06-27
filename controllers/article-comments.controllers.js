const { selectAllCommentsByArticleId } = require("../models/articles.models");

exports.getAllCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  selectAllCommentsByArticleId(article_id).then((comments) => {
    res.status(200).send({ comments });
  }).catch(next);
};
