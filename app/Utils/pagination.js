exports.getPagination = (page, size) => {
  // const limit = size ? + size : 10;

  const limit = size;

  // var r = r ? r : limit;

  const offset =
    !page || parseInt(page) === 1 || parseInt(page) === 0
      ? 0
      : page * limit - limit;

  return { limit, offset };
};
