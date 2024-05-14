exports.getPagination = (page, size) => {
  const limit = size;
  const parsedPage = parseInt(page, 10);
  const offset =
    !parsedPage || parsedPage === 1 || parsedPage === 0
      ? 0
      : parsedPage * limit - limit;
  return { limit, offset };
};

exports.limitCalculation = async (page = 1, limit = 5, count) => {
  let lowerLimit = (page - 1) * limit + 1;
  let upperLimit = page * limit;
  if (count < upperLimit) {
    upperLimit = count;
  }
  return { lowerLimit, upperLimit };
};
