const { deleteCommentById } = require("../models/comments.models");

exports.destroyCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  deleteCommentById(comment_id).then(() => {
    res.status(204).send({});
  }).catch(next);
};
