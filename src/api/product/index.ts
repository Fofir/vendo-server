import Hapi from "@hapi/hapi";
import {
  getProduct,
  createProduct,
  updateProduct,
  validateSellerProductOwnership,
  deleteProduct,
  getProducts,
} from "./handlers";
import {
  createProductPayloadSchema,
  deleteProductParamsSchema,
  getProductParamsSchema,
  updateProductParamsSchema,
  updateProductPayloadSchema,
} from "./validators";
import { UserRole } from "@prisma/client";

const register = async function (server: Hapi.Server) {
  server.route([
    {
      method: "POST",
      path: "/product",
      options: {
        validate: {
          payload: createProductPayloadSchema,
        },
        description: "Creates a new product",
        auth: {
          strategy: "session",
          scope: UserRole.SELLER,
        },
        tags: ["api", "product"],
        handler: createProduct,
      },
    },
    {
      method: "GET",
      path: "/product/{productId}",
      options: {
        description: "Retrieves information about a specific product",
        auth: "session",
        tags: ["api", "product"],
        validate: {
          params: getProductParamsSchema,
        },
        handler: getProduct,
      },
    },
    {
      method: "GET",
      path: "/products",
      options: {
        description:
          "Retrieves information about a all products that the user can view",
        auth: "session",
        tags: ["api", "product"],
        handler: getProducts,
      },
    },
    {
      method: "PUT",
      path: "/product/{productId}",
      options: {
        description: "Updates information for a specific product",
        auth: {
          strategy: "session",
          scope: UserRole.SELLER,
        },
        pre: [
          {
            assign: "isProductOwnedBySeller",
            method: validateSellerProductOwnership,
          },
        ],
        tags: ["api", "product"],
        validate: {
          params: updateProductParamsSchema,
          payload: updateProductPayloadSchema,
        },
        handler: updateProduct,
      },
    },
    {
      method: "DELETE",
      path: "/product/{productId}",
      options: {
        description: "Deletes a product",
        auth: {
          strategy: "session",
          scope: UserRole.SELLER,
        },
        pre: [
          {
            assign: "isProductOwnedBySeller",
            method: validateSellerProductOwnership,
          },
        ],
        tags: ["api", "product"],
        validate: {
          params: deleteProductParamsSchema,
        },
        handler: deleteProduct,
      },
    },
  ]);
};

const productApiPlugin = {
  register,
  name: "productApi",
};

export default productApiPlugin;
