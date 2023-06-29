const express = require('express');
const { getAllUsers } = require('../controllers/users.controllers');

const usersRouter = express.Router();

usersRouter.get('/', getAllUsers);

module.exports = usersRouter;
