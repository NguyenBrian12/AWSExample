const fileService = require("../services/file.service");
const responses = require("../models/responses/index");

const post = (req, res) => {
  var url = fileService.post(req.model);
  res.status(201).json(url);
  console.log(url);
};
const del = (req, res) => {
  var url = fileService.del(req.model);
  res.status(200).json(url);
  console.log(url);
};
module.exports = {
  post,
  del
};
