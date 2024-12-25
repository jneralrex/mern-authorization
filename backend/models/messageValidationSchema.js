const Joi = require("joi");

const messageValidationSchema = Joi.object({
  currentUser: Joi.object({
    _id: Joi.string().required(),
    username: Joi.string().required(),
  }).required(),
  selectedPerson: Joi.object({
    _id: Joi.string().required(),
    username: Joi.string().required(),
  }).required(),
  content: Joi.string().allow(null, ""), // Content can be empty if media is provided
  mediaUrl: Joi.string().uri().allow(null, ""), // Media URL should be a valid URI or empty
  mediaType: Joi.string()
    .valid("image", "video", "audio", "file")
    .allow(null, ""), // Media type is optional but must match these types if present
});

module.exports = messageValidationSchema;