function errorHandler(err, _req, res, _next) {
  console.log(err);

  if (err.status && err.message) {
    return res.status(err.status).json({ message: err.message });
  }

  switch (err.name) {
    case "SequelizeValidationError":
      if (
        err.errors &&
        err.errors[0] &&
        err.errors[0].message === "Validation isEmail on email failed"
      ) {
        res.status(400).json({ message: "Invalid email format" });
      } else {
        res.status(400).json({ message: err.errors[0].message });
      }
      return;
    case "SequelizeUniqueConstraintError":
      res.status(400).json({ message: "Email must be unique" });
      return;
    case "BadRequest":
      res.status(400).json({ message: err.message });
      return;
    case "Unauthorized":
      res.status(401).json({ message: "Invalid token" });
      return;
    case "Forbidden":
      res
        .status(403)
        .json({ message: err.message || "You are not authorized" });
      return;
    case "NotFound":
      res.status(404).json({ message: err.message });
      return;
    case "JsonWebTokenError":
      res.status(401).json({ message: "Invalid token" });
      return;
    case "errorLogin":
      res.status(401).json({ message: "Invalid email/password" });
      return;
    case "errorRegister":
      res.status(400).json({ message: "Email or Password required" });
      return;
    default:
      res.status(500).json({ message: err.message || "Internal Server Error" });
      return;
  }
}

module.exports = errorHandler;
