export function errorHandler(error, req, res, next) {
  console.error(error);

  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server error.' : error.message,
  });
}

export function asyncHandler(fn){
  return (req, res, next) => {
    Promise.resolve()
      .then (()=> fn(req, res, next))
      .catch(next)
};
}

export function httpError(statusCode, message) {
  const error = new Error(message || "Not found");
  error.statusCode = statusCode || 404;
  return error;
}