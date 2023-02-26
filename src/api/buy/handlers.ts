import { badRequest, boomify, notFound } from "@hapi/boom";
import { IRequest } from "../../interfaces/server";

export const buy = async (request: IRequest) => {
  const {
    payload,
    server: {
      plugins: {
        services: { usersService, productsService },
      },
    },
    auth: { credentials },
  } = request;

  const { amount, productId } = payload as {
    amount: number;
    productId: number;
  };

  const product = await productsService.findUniqeById(productId);

  if (!product) {
    return notFound("PRODUCT_NOT_FOUND");
  }

  if (product.amountAvailable === 0) {
    return badRequest("PRODUCT_OUT_OF_STOCK");
  }

  const totalCost = product.cost * amount;

  try {
    const result = await usersService.subtractFundForUserWithId(
      parseInt(credentials.userId, 10),
      totalCost
    );

    await productsService.subtractAmountAvailable(productId, amount);

    return {
      ...result,
      productName: product.productName,
    };
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === usersService.errors.INSUFFICIENT_FUNDS) {
        return badRequest(err.message);
      }

      if (err.message === usersService.errors.USER_NOT_FOUND) {
        return notFound(err.message);
      }

      return boomify(err);
    }
  }
};
