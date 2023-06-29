const { deleteCommentById, updateCommentById } = require("../models/comments.models");

exports.editCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  updateCommentById(comment_id, req.body).then((comment) => {
    res.status(200).send({ comment });
  }).catch(next);
};

exports.destroyCommentById = (req, res, next) => {
  const { comment_id } = req.params;

  deleteCommentById(comment_id).then(() => {
    res.status(204).send({});
  }).catch(next);
};
