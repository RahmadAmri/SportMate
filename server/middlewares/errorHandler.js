const errorHandler = (err, _req, res, _next) => {
  console.log(err);

  if (err.name === "Unauthorized" || err.name === "JsonWebTokenError") {
    res.status(401).json({ message: "Invalid Token" });
  } else if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    res.status(400).json({ message: err.errors[0].message });
  } else if (err.name === "errorLogin") {
    res.status(400).json({ message: "Email is required" });
  } else if (err.name === "errorPassword") {
    res.status(400).json({ message: "errorPassword" });
  } else if (err.name === "NotFound") {
    res.status(404).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = errorHandler;
