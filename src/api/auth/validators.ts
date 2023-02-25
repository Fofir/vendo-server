import Joi from "joi";

export const loginUserPayloadSchema = Joi.object({
  username: Joi.string().required().description("Username"),
  password: Joi.string().required().description("Password"),
}).description("Required payload for user creation");
