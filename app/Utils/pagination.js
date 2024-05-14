exports.getPagination = (page, size) => {
  const limit = size;
  const parsedPage = parseInt(page, 10);
  const offset =
    !parsedPage || parsedPage === 1 || parsedPage === 0
      ? 0
      : parsedPage * limit - limit;
  return { limit, offset };
};

