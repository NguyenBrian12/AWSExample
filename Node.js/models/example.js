const Joi = require("joi");
const schema = {
  id: Joi.number(),
  url: Joi.string(),
  name: Joi.string()
    .min(2)
    .max(50),
  description: Joi.string()
    .min(2)
    .max(150),
  typeId: Joi.number(),
  appUserId: Joi.number(),
  businessId: Joi.number(),
  tenantId: Joi.number()
};
module.exports = Joi.object().keys(schema);
