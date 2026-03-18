
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  
  if (err.name === "MulterError") {
    return res.status(400).json({
      status: false,
      message: err.message,
    });
  }

  
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: false,
      message: err.message,
    });
  }

  
  res.status(500).json({
    status: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
