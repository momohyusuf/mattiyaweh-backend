const routeNotFound = (req, res) =>
  res
    .status(404)
    .send("Route does note exist on sever ensure the url is correct");

module.exports = routeNotFound;
