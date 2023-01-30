const { sendError } = require("../utils/helper");

module.exports = (req, res, next) => {
  if (req.session.isAuth) {
    console.log("okkkkkkk");
    next();
  } else {
    sendError(res, "You need to login!");
  }
};
