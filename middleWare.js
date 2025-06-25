function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // يكمل للراوت
  }
  res.status(401).json({ error: "Unauthorized" });
}
module.exports = { ensureAuth };