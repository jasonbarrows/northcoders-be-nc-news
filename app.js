const express = require('express');
const apiRouter = require('./routes/api.router');
const { handleCustomErrors, handlePsqlErrors, handleServerErrors } = require('./errors');

const app = express();

app.use('/api', apiRouter);

app.get('*', (_, res) => {
  res.status(404).send({ message: 'Not found' });
})

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
