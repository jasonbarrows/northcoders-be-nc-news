const { selectAllCommentsByArticleId } = require("../models/articles.models");
const { insertCommentByArticleId } = require("../models/comments.models");

const validateRequestBody = (body, rules) => {
  const result = {};

  for (const key in rules) {
    const isRequired = !body[key] === rules[key].required;
    const notMatchesType = typeof body[key] !== rules[key].type;

    if (isRequired && notMatchesType) return false;

    result[key] = body[key];
  }

  return result;
};

exports.getAllCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  selectAllCommentsByArticleId(article_id).then((comments) => {
    res.status(200).send({ comments });
  }).catch(next);
};

exports.createCommentbyArticleId = (req, res, next) => {
  const { article_id } = req.params;

  const validated = validateRequestBody(req.body, {
    username: { required: true, type: 'string'},
    body: { required: true, type: 'string'},
  });

  if (validated) {
    insertCommentByArticleId(article_id, validated).then((insertedComment) => {
      res.status(201).send({ comment: insertedComment });
    }).catch(next);
  } else {
    res.status(400).send({ message: 'Bad Request' });
  }
};
