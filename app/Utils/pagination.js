exports.getPagination = (page, size) => {
  const limit = size;
  const offset =
  !page || parseInt(page) === 1 ||
  parseInt(page) === 0 ? 0 : (page * limit) - limit;
  return {limit, offset};
};
