const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.log('catchAsync', JSON.stringify(err));
    next(err);
  });
};

export { catchAsync };
