exports.getPagination = (page, size) => {
  const limit = size;
  const parsedPage = parseInt(page, 10);
  const offset = parsedPage ? (parsedPage - 1) * limit : 0;
  return { limit, offset };
};
