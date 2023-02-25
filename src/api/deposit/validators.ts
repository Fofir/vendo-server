import Joi from "joi";

export const depositPayloadSchema = Joi.object({
  deposit: Joi.number()
    .valid(5, 10, 20, 50, 100)
    .required()
    .description("The amount of deposit to add to the user account"),
}).description("Required payload for depositing amounts");
