exports.getPagination = (page, size) => {
  const limit = size ? parseInt(size, 10) : 10;
  let parsedPage = parseInt(page, 10);
  parsedPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage; // Ensure parsedPage is a positive integer
  const offset = (parsedPage - 1) * limit;
  return { limit, offset };
};
