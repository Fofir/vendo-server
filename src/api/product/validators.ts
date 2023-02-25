import Joi from "joi";

// "amountAvailable" | "cost" | "productName"

export const createProductPayloadSchema = Joi.object({
  productName: Joi.string().required().description("Product name"),
  amountAvailable: Joi.number()
    .min(0)
    .required()
    .description("The number of units in stock"),
  cost: Joi.number()
    .min(0)
    .required()
    .description("The price in cents of each unit"),
}).description("Required payload for product creation");

export const updateProductPayloadSchema = createProductPayloadSchema;

export const getProductParamsSchema = Joi.object({
  productId: Joi.number()
    .min(1)
    .required()
    .description("Unique id of a product"),
});

export const updateProductParamsSchema = getProductParamsSchema;
export const deleteProductParamsSchema = getProductParamsSchema;
