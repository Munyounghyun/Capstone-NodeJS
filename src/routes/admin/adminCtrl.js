const adminControl = (req, res, next) => {
  res.json({ admin: "admin" });
};

module.exports = {
  adminControl,
};
