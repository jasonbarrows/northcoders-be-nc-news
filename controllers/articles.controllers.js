const { selectAllArticles, selectArticleById, updateArticleById } = require("../models/articles.models");

exports.getAllArticles = (req, res, next) => {
  selectAllArticles().then((articles) => {
    res.status(200).send({ articles });
  }).catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticleById(article_id).then((article) => {
    res.status(200).send({ article });
  }).catch(next);
};

exports.editArticleById = (req, res, next) => {
  const { article_id } = req.params;

  updateArticleById(article_id, req.body).then((article) => {
    res.status(200).send({ article });
  }).catch(next);
};
