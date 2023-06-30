const { selectAllTopics, insertTopic } = require("../models/topics.models");

exports.getAllTopics = (req, res, next) => {
  selectAllTopics().then((topics) => {
    res.status(200).send({ topics });
  }).catch(next);
};

exports.createTopic = (req, res, next) => {
  insertTopic(req.body).then((topic) => {
    res.status(201).send({ topic });
  }).catch(next);
};
