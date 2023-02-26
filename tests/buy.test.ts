import { PrismaClient } from "@prisma/client";
import { createServer } from "../app/server";
import { IServer } from "../src/interfaces/server";
import { clearDb } from "./test-helpers";
import { User } from "../src/interfaces/user";
import { Product } from "../src/interfaces/Product";

describe("Buy API", () => {
  let server: IServer;
  let prisma: PrismaClient;

  let seller: User;
  let buyerWithSuffienctFunds: User;
  let buyerWithInsuffienctFunds: User;

  let product: Product;
  let productOutOfStock: Product;

  beforeAll(async () => {
    server = await createServer();
    prisma = server.app.prisma;
    await clearDb(prisma);

    seller = await prisma.user.create({
      data: {
        username: "Suaron",
        password: "i-got-eyes-on-you",
        deposit: 0,
        role: "SELLER",
      },
    });

    buyerWithInsuffienctFunds = await prisma.user.create({
      data: {
        username: "Gollum",
        password: "precious1997",
        deposit: 0,
        role: "BUYER",
      },
    });

    buyerWithSuffienctFunds = await prisma.user.create({
      data: {
        username: "Smeagol",
        password: "fishisgood",
        deposit: 100 + 100 + 50 + 20 + 10 + 5,
        role: "BUYER",
      },
    });

    product = await prisma.product.create({
      data: {
        productName: "Mountain Dew",
        amountAvailable: 200,
        cost: 100,
        sellerId: seller.id,
      },
    });

    productOutOfStock = await prisma.product.create({
      data: {
        productName: "Pepsi",
        amountAvailable: 0,
        cost: 100,
        sellerId: seller.id,
      },
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("POST /buy", () => {
    describe("when the user is not autehnticated", () => {
      it("fails", async () => {
        const repsonse = await server.inject({
          method: "POST",
          url: "/buy",
        });

        expect(repsonse.statusCode).toEqual(401);
      });
    });

    describe("when the user is not a buyer", () => {
      it("fails", async () => {
        const repsonse = await server.inject({
          method: "POST",
          url: "/buy",
          auth: {
            strategy: "session",
            credentials: {
              userId: `${seller.id}`,
              scope: [seller.role],
            },
          },
        });

        expect(repsonse.statusCode).toEqual(403);
      });
    });

    describe("when the user is a buyer", () => {
      describe("when the product ID is missing", () => {
        it("fails", async () => {
          const repsonse = await server.inject({
            method: "POST",
            url: "/buy",
            payload: {
              amount: 1,
            },
            auth: {
              strategy: "session",
              credentials: {
                userId: `${buyerWithSuffienctFunds.id}`,
                scope: [buyerWithSuffienctFunds.role],
              },
            },
          });

          expect(repsonse.statusCode).toEqual(400);
        });
      });

      describe("when the amount is missing", () => {
        it("fails", async () => {
          const repsonse = await server.inject({
            method: "POST",
            url: "/buy",
            payload: {
              productId: product.id,
            },
            auth: {
              strategy: "session",
              credentials: {
                userId: `${buyerWithSuffienctFunds.id}`,
                scope: [buyerWithSuffienctFunds.role],
              },
            },
          });

          expect(repsonse.statusCode).toEqual(400);
        });
      });

      describe("when the user has insufficient funds", () => {
        it("fails", async () => {
          const repsonse = await server.inject({
            method: "POST",
            url: "/buy",
            payload: {
              amount: 1,
              productId: product.id,
            },
            auth: {
              strategy: "session",
              credentials: {
                userId: `${buyerWithInsuffienctFunds.id}`,
                scope: [buyerWithInsuffienctFunds.role],
              },
            },
          });

          expect(repsonse.statusCode).toEqual(400);
          expect(repsonse.result).toEqual({
            error: "Bad Request",
            message: "INSUFFICIENT_FUNDS",
            statusCode: 400,
          });
        });
      });

      describe("when the user tries to by an amount that is larger than the stock for the product", () => {
        it("fails", async () => {
          const repsonse = await server.inject({
            method: "POST",
            url: "/buy",
            payload: {
              amount: 1,
              productId: productOutOfStock.id, // costs 100,
            },
            auth: {
              strategy: "session",
              credentials: {
                userId: `${buyerWithSuffienctFunds.id}`, // has 200 in deposit,
                scope: [buyerWithSuffienctFunds.role],
              },
            },
          });

          expect(repsonse.statusCode).toEqual(400);
          expect(repsonse.result).toEqual({
            error: "Bad Request",
            message: "PRODUCT_OUT_OF_STOCK",
            statusCode: 400,
          });
        });
      });

      describe("when the user has sufficient funds", () => {
        it("returns total they've spent, products they’ve purchased and their change if there's any (in an array of 5, 10, 20, 50 and 100 cent coins)", async () => {
          const repsonse = await server.inject({
            method: "POST",
            url: "/buy",
            payload: {
              amount: 1,
              productId: product.id, // costs 100,
            },
            auth: {
              strategy: "session",
              credentials: {
                userId: `${buyerWithSuffienctFunds.id}`, // has 200 in deposit,
                scope: [buyerWithSuffienctFunds.role],
              },
            },
          });

          expect(repsonse.statusCode).toEqual(200);
          expect(repsonse.result).toEqual({
            change: [100, 50, 20, 10, 5],
            spent: 100,
            productName: "Mountain Dew",
          });

          const user = await prisma.user.findUnique({
            where: {
              id: buyerWithSuffienctFunds.id,
            },
          });

          expect(user?.deposit).toEqual(0);

          const productAfterSale = await prisma.product.findUnique({
            where: {
              id: product.id,
            },
          });

          expect(productAfterSale?.amountAvailable).toEqual(199);
        });
      });
    });
  });
});
