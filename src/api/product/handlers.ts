import { Lifecycle, ResponseToolkit } from "@hapi/hapi";
import { notFound, forbidden } from "@hapi/boom";
import { IRequest } from "../../interfaces/server";
import {
  ProductCreationPayload,
  ProductUpdatePayload,
} from "../../interfaces/Product";

export const getProduct = async (request: IRequest, h: ResponseToolkit) => {
  const {
    server: {
      plugins: {
        services: { productsService },
      },
    },
    params,
  } = request;

  const { productId } = params as { productId: number };

  const product = await productsService.findUniqeById(productId);

  if (!product) {
    return notFound("PRODUCT_NOT_FOUND");
  }

  return product;
};

export const createProduct = async (request: IRequest, h: ResponseToolkit) => {
  const {
    payload,
    server: {
      plugins: {
        services: { productsService },
      },
    },
    auth: { credentials },
  } = request;

  const { productName, amountAvailable, cost } =
    payload as ProductCreationPayload;

  const product = await productsService.create({
    productName,
    amountAvailable,
    cost,
    sellerId: parseInt(credentials.userId, 10),
  });

  return h.response(product).code(201);
};

export const updateProduct = async (request: IRequest) => {
  const {
    payload,
    server: {
      plugins: {
        services: { productsService },
      },
    },
    params,
  } = request;

  const { productId } = params as { productId: number };

  const { productName, amountAvailable, cost } =
    payload as ProductUpdatePayload;

  const updatedProduct = await productsService.update(productId, {
    productName,
    amountAvailable,
    cost,
  });

  return updatedProduct;
};

export const deleteProduct = async (request: IRequest, h: ResponseToolkit) => {
  const {
    server: {
      plugins: {
        services: { productsService },
      },
    },
    params,
  } = request;

  const { productId } = params as { productId: number };

  await productsService.delete(productId);

  return h.response();
};

export const validateSellerProductOwnership: Lifecycle.Method = async (
  request
) => {
  const {
    server: {
      plugins: {
        services: { productsService },
      },
    },
    params,
    auth: { credentials },
  } = request as IRequest;

  const { productId } = params as { productId: number };

  const isProductOwnedBySeller = await productsService.isProductOwnedBySeller(
    productId,
    parseInt(credentials.userId, 10)
  );

  if (!isProductOwnedBySeller) {
    return forbidden();
  }

  return isProductOwnedBySeller;
};
