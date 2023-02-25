import Joi from "joi";

export const createUserPayloadSchema = Joi.object({
  username: Joi.string().required().description("Username"),
  password: Joi.string().required().description("Password"),
}).description("Required payload for user creation");
