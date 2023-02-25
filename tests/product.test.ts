import { PrismaClient, Product, UserRole } from "@prisma/client";
import { createServer } from "../app/server";
import { IServer } from "../src/interfaces/server";
import { clearDb } from "./test-helpers";
import { User } from "../src/interfaces/user";
import { omit } from "lodash";

describe("Product API", () => {
  let server: IServer;
  let prisma: PrismaClient;

  let seller: User;
  let anotherSeller: User;
  let buyer: User;

  beforeAll(async () => {
    server = await createServer();
    prisma = server.app.prisma;
    await clearDb(prisma);

    buyer = await prisma.user.create({
      data: {
        username: "TreeBeard23",
        password: "lovetress",
        role: "BUYER",
        deposit: 0,
      },
    });

    seller = await prisma.user.create({
      data: {
        username: "Saroman23",
        password: "shhhh-im-in-the-tower-and-i-am-evil",
        role: "SELLER",
        deposit: 0,
      },
    });

    anotherSeller = await prisma.user.create({
      data: {
        username: "Merry23",
        password: "they-are-taking-the-hobbits-to-isengard",
        role: "SELLER",
        deposit: 0,
      },
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("POST /product", () => {
    describe("when the creating user is not authenticated", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "POST",
          url: "/product",
          payload: {
            productName: "One Ring",
            amountAvailable: 1,
            cost: 180 * 100,
          },
        });

        expect(response.statusCode).toEqual(401);

        expect(response.result).toEqual({
          error: "Unauthorized",
          message: "Missing authentication",
          statusCode: 401,
        });
      });
    });

    describe("when the creating user is not a seller", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "POST",
          url: "/product",
          payload: {
            productName: "One Ring",
            amountAvailable: 1,
            cost: 180 * 100,
          },
          auth: {
            strategy: "session",
            credentials: {
              // Hapi types state clearly that the userId in the credentials object needs to be a string
              userId: `${buyer.id}`,
              scope: [UserRole.BUYER],
            },
          },
        });

        expect(response.statusCode).toEqual(403);

        expect(response.result).toEqual({
          error: "Forbidden",
          message: "Insufficient scope",
          statusCode: 403,
        });
      });
    });

    describe("when the creating user is a seller", () => {
      describe("when all required information about the product is provided", () => {
        it("creates a product and returns information about it", async () => {
          const response = await server.inject({
            method: "POST",
            url: "/product",
            payload: {
              productName: "One Ring",
              amountAvailable: 1,
              cost: 180 * 100,
            },
            auth: {
              strategy: "session",
              credentials: {
                // Hapi types state clearly that the userId in the credentials object needs to be a string
                userId: `${seller.id}`,
                scope: [UserRole.SELLER],
              },
            },
          });

          expect(response.statusCode).toEqual(201);

          expect(response.result).toEqual(
            expect.objectContaining({
              id: expect.any(Number),
              productName: "One Ring",
              amountAvailable: 1,
              cost: 180 * 100,
            })
          );

          const result = response.result as Partial<Product>;

          const produtFromDb = await prisma.product.findUnique({
            where: {
              id: result.id,
            },
          });

          expect(produtFromDb).toMatchObject({
            productName: "One Ring",
            amountAvailable: 1,
            cost: 180 * 100,
          });
        });
      });

      const validPayload = {
        productName: "New Spear",
        amountAvailable: 99,
        cost: 2 * 100,
      };

      describe("when some information is missing", () => {
        const testFailureWithMissingPayloadField = async (
          fieldName: string
        ) => {
          it(`fails when '${fieldName}' is missing`, async () => {
            const response = await server.inject({
              method: "POST",
              url: "/product",
              payload: omit(validPayload, [fieldName]),
              auth: {
                strategy: "session",
                credentials: {
                  // Hapi types state clearly that the userId in the credentials object needs to be a string
                  userId: `${seller.id}`,
                  scope: [seller.role],
                },
              },
            });

            expect(response.statusCode).toEqual(400);
          });
        };

        testFailureWithMissingPayloadField("amountAvailable");
        testFailureWithMissingPayloadField("cost");
        testFailureWithMissingPayloadField("productName");
      });

      describe("when the cost is negative", () => {
        it("fails", async () => {
          const response = await server.inject({
            method: "POST",
            url: "/product",
            payload: {
              ...validPayload,
              cost: -1,
            },
            auth: {
              strategy: "session",
              credentials: {
                // Hapi types state clearly that the userId in the credentials object needs to be a string
                userId: `${seller.id}`,
                scope: [seller.role],
              },
            },
          });

          expect(response.statusCode).toEqual(400);
        });
      });

      describe("when the amountAvailable is negative", () => {
        it("fails", async () => {
          const response = await server.inject({
            method: "POST",
            url: "/product",
            payload: {
              ...validPayload,
              amountAvailable: -1,
            },
            auth: {
              strategy: "session",
              credentials: {
                // Hapi types state clearly that the userId in the credentials object needs to be a string
                userId: `${seller.id}`,
                scope: [seller.role],
              },
            },
          });

          expect(response.statusCode).toEqual(400);
        });
      });
    });
  });

  describe("PUT /product/{productId}", () => {
    let productToUpdate: Product;

    beforeAll(async () => {
      productToUpdate = await prisma.product.create({
        data: {
          productName: "Crossbow",
          cost: 100 * 100,
          amountAvailable: 32,
          sellerId: seller.id,
        },
      });
    });
    describe("when the updating user is not authenticated", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "PUT",
          url: "/product/2",
          payload: {
            productName: "One Ring",
            amountAvailable: 1,
            cost: 180 * 100,
          },
        });

        expect(response.statusCode).toEqual(401);

        expect(response.result).toEqual({
          error: "Unauthorized",
          message: "Missing authentication",
          statusCode: 401,
        });
      });
    });

    describe("when the updating user is not a seller", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "PUT",
          url: "/product/45",
          payload: {
            productName: "One Ring",
            amountAvailable: 1,
            cost: 180 * 100,
          },
          auth: {
            strategy: "session",
            credentials: {
              // Hapi types state clearly that the userId in the credentials object needs to be a string
              userId: `${buyer.id}`,
              scope: [buyer.role],
            },
          },
        });

        expect(response.statusCode).toEqual(403);

        expect(response.result).toEqual({
          error: "Forbidden",
          message: "Insufficient scope",
          statusCode: 403,
        });
      });
    });

    describe("when the updating user is a seller that DOES NOT own the product", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "PUT",
          url: `/product/${productToUpdate.id}`,
          payload: {
            productName: "Red Crossbow",
            amountAvailable: 20,
            cost: 180 * 100,
          },
          auth: {
            strategy: "session",
            credentials: {
              // Hapi types state clearly that the userId in the credentials object needs to be a string
              userId: `${anotherSeller.id}`,
              scope: [anotherSeller.role],
            },
          },
        });

        expect(response.statusCode).toEqual(403);
      });
    });

    describe("when the updating user is a seller that owns the product", () => {
      describe("when all required information about the product is provided", () => {
        it("updates a product and returns the updated information about it", async () => {
          const response = await server.inject({
            method: "PUT",
            url: `/product/${productToUpdate.id}`,
            payload: {
              productName: "Red Crossbow",
              amountAvailable: 20,
              cost: 180 * 100,
            },
            auth: {
              strategy: "session",
              credentials: {
                // Hapi types state clearly that the userId in the credentials object needs to be a string
                userId: `${seller.id}`,
                scope: [seller.role],
              },
            },
          });

          expect(response.statusCode).toEqual(200);

          expect(response.result).toEqual(
            expect.objectContaining({
              id: expect.any(Number),
              productName: "Red Crossbow",
              amountAvailable: 20,
              cost: 180 * 100,
            })
          );

          const result = response.result as Partial<Product>;

          const produtFromDb = await prisma.product.findUnique({
            where: {
              id: result.id,
            },
          });

          expect(produtFromDb).toMatchObject({
            productName: "Red Crossbow",
            amountAvailable: 20,
            cost: 180 * 100,
          });
        });
      });

      const validPayload = {
        productName: "Red Crossbow",
        amountAvailable: 20,
        cost: 180 * 100,
      };

      describe("when some information is missing", () => {
        const testFailureWithMissingPayloadField = async (
          fieldName: string
        ) => {
          it(`fails when '${fieldName}' is missing`, async () => {
            const response = await server.inject({
              method: "PUT",
              url: `/product/${productToUpdate.id}`,
              payload: omit(validPayload, [fieldName]),
              auth: {
                strategy: "session",
                credentials: {
                  // Hapi types state clearly that the userId in the credentials object needs to be a string
                  userId: `${seller.id}`,
                  scope: [seller.role],
                },
              },
            });

            expect(response.statusCode).toEqual(400);
          });
        };

        testFailureWithMissingPayloadField("amountAvailable");
        testFailureWithMissingPayloadField("cost");
        testFailureWithMissingPayloadField("productName");
      });

      describe("when the cost is negative", () => {
        it("fails", async () => {
          const response = await server.inject({
            method: "PUT",
            url: `/product/${productToUpdate.id}`,
            payload: {
              ...validPayload,
              cost: -1,
            },
            auth: {
              strategy: "session",
              credentials: {
                // Hapi types state clearly that the userId in the credentials object needs to be a string
                userId: `${seller.id}`,
                scope: [seller.role],
              },
            },
          });

          expect(response.statusCode).toEqual(400);
        });
      });

      describe("when the amountAvailable is negative", () => {
        it("fails", async () => {
          const response = await server.inject({
            method: "PUT",
            url: `/product/${productToUpdate.id}`,
            payload: {
              ...validPayload,
              amountAvailable: -1,
            },
            auth: {
              strategy: "session",
              credentials: {
                // Hapi types state clearly that the userId in the credentials object needs to be a string
                userId: `${seller.id}`,
                scope: [seller.role],
              },
            },
          });

          expect(response.statusCode).toEqual(400);
        });
      });
    });
  });

  describe("GET /product/{productId}", () => {
    describe("when requester is not authenticated", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "GET",
          url: "/product/1",
        });

        expect(response.statusCode).toEqual(401);
        expect(response.result).toEqual({
          error: "Unauthorized",
          message: "Missing authentication",
          statusCode: 401,
        });
      });
    });

    describe("when requester is authenticated", () => {
      let product: Product;
      beforeAll(async () => {
        product = await prisma.product.create({
          data: {
            productName: "Sword",
            amountAvailable: 2,
            cost: 23 * 100,
            sellerId: buyer.id,
          },
        });
      });

      describe("when the product exists", () => {
        it("returns information about the product", async () => {
          const response = await server.inject({
            method: "GET",
            url: `/product/${product.id}`,
            auth: {
              strategy: "session",
              credentials: {
                // Hapi types state clearly that the userId in the credentials object needs to be a string
                userId: `${buyer.id}`,
                scope: [buyer.role],
              },
            },
          });

          expect(response.statusCode).toEqual(200);
          expect(response.result).toEqual(
            expect.objectContaining({
              id: expect.any(Number),
              productName: "Sword",
              amountAvailable: 2,
              cost: 23 * 100,
            })
          );
        });
      });

      describe("when the product does not exist", () => {
        it("fails", async () => {
          const response = await server.inject({
            method: "GET",
            url: "/product/43666",
            auth: {
              strategy: "session",
              credentials: {
                // Hapi types state clearly that the userId in the credentials object needs to be a string
                userId: `${buyer.id}`,
                scope: [buyer.role],
              },
            },
          });

          expect(response.statusCode).toEqual(404);
          expect(response.result).toEqual({
            error: "Not Found",
            message: "PRODUCT_NOT_FOUND",
            statusCode: 404,
          });
        });
      });
    });
  });

  describe("DELETE /product/{productId}", () => {
    let productToDelete: Product;

    beforeAll(async () => {
      productToDelete = await prisma.product.create({
        data: {
          productName: "Bronze Sword",
          cost: 100 * 100,
          amountAvailable: 32,
          sellerId: seller.id,
        },
      });
    });

    describe("when the deleting user is not authenticated", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "DELETE",
          url: "/product/2",
        });

        expect(response.statusCode).toEqual(401);

        expect(response.result).toEqual({
          error: "Unauthorized",
          message: "Missing authentication",
          statusCode: 401,
        });
      });
    });

    describe("when the deleting user is not a seller", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "DELETE",
          url: "/product/45",
          auth: {
            strategy: "session",
            credentials: {
              // Hapi types state clearly that the userId in the credentials object needs to be a string
              userId: `${buyer.id}`,
              scope: [buyer.role],
            },
          },
        });

        expect(response.statusCode).toEqual(403);

        expect(response.result).toEqual({
          error: "Forbidden",
          message: "Insufficient scope",
          statusCode: 403,
        });
      });
    });

    describe("when the deleting user is a seller that DOES NOT own the product", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "DELETE",
          url: `/product/${productToDelete.id}`,
          auth: {
            strategy: "session",
            credentials: {
              // Hapi types state clearly that the userId in the credentials object needs to be a string
              userId: `${anotherSeller.id}`,
              scope: [anotherSeller.role],
            },
          },
        });

        expect(response.statusCode).toEqual(403);
      });
    });

    describe("when the deleting user is a seller that owns the product", () => {
      it("deletes ther product", async () => {
        const response = await server.inject({
          method: "DELETE",
          url: `/product/${productToDelete.id}`,
          auth: {
            strategy: "session",
            credentials: {
              // Hapi types state clearly that the userId in the credentials object needs to be a string
              userId: `${seller.id}`,
              scope: [seller.role],
            },
          },
        });

        expect(response.statusCode).toEqual(204);
        expect(response.result).toEqual(null);

        const produtFromDb = await prisma.product.findUnique({
          where: {
            id: productToDelete.id,
          },
        });

        expect(produtFromDb).toBeNull();
      });
    });
  });
});
