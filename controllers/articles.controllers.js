const { selectAllArticles, selectArticleById, updateArticleById, insertArticle } = require("../models/articles.models");

exports.getAllArticles = (req, res, next) => {
  selectAllArticles(req.query).then((articles) => {
    const result = {
      articles: articles.map(({ total_count, ...rest }) => {
        return rest;
      }),
    };

    result.total_count = articles.length ? articles[0].total_count : 0;

    res.status(200).send(result);
  }).catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticleById(article_id).then((article) => {
    res.status(200).send({ article });
  }).catch(next);
};

exports.createArticle = (req, res, next) => {
  insertArticle(req.body).then((article) => {
    res.status(201).send({ article });
  }).catch(next);
};

exports.editArticleById = (req, res, next) => {
  const { article_id } = req.params;

  updateArticleById(article_id, req.body).then((article) => {
    res.status(200).send({ article });
  }).catch(next);
};
