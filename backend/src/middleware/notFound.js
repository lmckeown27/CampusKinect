const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  
  // Log the 404 request
  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl} from ${req.ip}`);
  
  next(error);
};

module.exports = notFound; 