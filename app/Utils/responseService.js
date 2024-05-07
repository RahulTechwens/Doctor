exports.handleSuccessMessage = (res, code, msg, data, additional = {}) => {
    const success = {
      message: msg,
      status: true,
      statusCode: code,
      data,
      ...additional,
    };
    return res.status(code).json(success);
  };
  
  exports.handleErrorMessage = (res, code, msg, additional = {}) => {
    const error = {
      message: msg || 'Something went wrong. Please try again later.',
      status: false,
      statusCode: code || 500,
      data: 'failed',
      ...additional,
    };
    return res.status(code || 500).json(error);
  };