exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code) {
    res.status(400).send({ message: 'Bad request' });
  } else next(err);
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ message: err.message });
  } else next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  console.log('Internal Server Error', err);
  res.status(500).send({ message: 'It\'s not you, its us.' });
};
