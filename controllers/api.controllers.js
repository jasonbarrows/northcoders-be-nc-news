const fs = require('fs/promises');

exports.getAllEndpoints = (req, res, next) => {
  fs.readFile(`${__dirname}/../endpoints.json`, 'utf8').then((result) => {
    const api = JSON.parse(result);
    res.status(200).send({ api });
  }).catch(next);
};
