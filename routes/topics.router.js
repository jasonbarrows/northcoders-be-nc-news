const express = require('express');
const { getAllTopics } = require('../controllers/topics.controllers');

const topicsRouter = express.Router();

topicsRouter.get('/', getAllTopics);

module.exports = topicsRouter;
