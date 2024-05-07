const { handleErrorMessage } = require('../Utils/responseService');

exports.errorHandler = (err, req, res, next) => {
  res.locals.message = err.message || 'Please, Try Again After Some Time';
  handleErrorMessage(res, err.status || 500, res.locals.message);
  next();
};