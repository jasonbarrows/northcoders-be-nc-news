const express = require('express');
const { getAllTopics, createTopic } = require('../controllers/topics.controllers');

const topicsRouter = express.Router();

topicsRouter.get('/', getAllTopics);
topicsRouter.post('/', express.json(), createTopic);

module.exports = topicsRouter;
