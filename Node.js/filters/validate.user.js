/*
This express middleware function will return a 403 if the user is not logged in.
*/

module.exports = function validateUser(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.status(403).end("Not logged in");
  }
};
