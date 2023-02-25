import Joi from "joi";

export const buyPayloadSchema = Joi.object({
  productId: Joi.number()
    .min(1)
    .required()
    .description("The ID of the product to buy"),
  amount: Joi.number()
    .min(1)
    .required()
    .description("The amount of products the user wishes to buy"),
}).description("Required payload for initiaing a prouct purchase");
