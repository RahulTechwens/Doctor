const { validationResult } = require('express-validator');
const { handleErrorMessage } = require('../Utils/responseService');
 
exports.validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return handleErrorMessage(res, 400, errors.array()[0].msg);
  }
  return next();
};