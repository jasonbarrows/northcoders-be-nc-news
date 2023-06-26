exports.handleServerErrors = (err, req, res, next) => {
  console.log('Internal Server Error', err);
  res.status(500).send({ message: 'It\'s not you, its us.' });
};
