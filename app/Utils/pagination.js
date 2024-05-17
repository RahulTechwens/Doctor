exports.getPagination = (page, size) => {
  const limit = size ? parseInt(size, 10) : 10;
  const parsedPage = parseInt(page, 10);
  const offset = parsedPage && parsedPage > 0 ? (parsedPage - 1) * limit : 0;
  return { limit, offset };
};
