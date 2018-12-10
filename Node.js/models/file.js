const Joi = require("joi");

const schema = {
  contentType: Joi.string().required()
};

module.exports = Joi.object().keys(schema);
