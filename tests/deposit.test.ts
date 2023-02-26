import { PrismaClient } from "@prisma/client";
import { createServer } from "../app/server";
import { IServer } from "../src/interfaces/server";
import { clearDb } from "./test-helpers";
import { User } from "../src/interfaces/user";

describe("Deposit API", () => {
  let server: IServer;
  let prisma: PrismaClient;

  let seller: User;
  let buyer: User;

  beforeAll(async () => {
    server = await createServer();
    prisma = server.app.prisma;
    await clearDb(prisma);

    seller = await prisma.user.create({
      data: {
        username: "Galadriel",
        password: "gotta-love-elves",
        deposit: 0,
        role: "SELLER",
      },
    });

    buyer = await prisma.user.create({
      data: {
        username: "Arwen",
        password: "gotta-love-elves",
        deposit: 5,
        role: "BUYER",
      },
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("POST /deposit", () => {
    describe("when the user is not autehnticated", () => {
      it("fails", async () => {
        const repsonse = await server.inject({
          method: "POST",
          url: "/deposit",
        });

        expect(repsonse.statusCode).toEqual(401);
      });
    });

    describe("when the user is not a buyer", () => {
      it("fails", async () => {
        const repsonse = await server.inject({
          method: "POST",
          url: "/deposit",
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
      describe("when the deposited amount is missing", () => {
        it("fails", async () => {
          const repsonse = await server.inject({
            method: "POST",
            url: "/deposit",
            auth: {
              strategy: "session",
              credentials: {
                userId: `${buyer.id}`,
                scope: [buyer.role],
              },
            },
          });

          expect(repsonse.statusCode).toEqual(400);
        });
      });

      describe("when the deposited amount is NOT of the accepted denominations", () => {
        it("fails", async () => {
          const repsonse = await server.inject({
            method: "POST",
            url: "/deposit",
            payload: {
              deposit: 25,
            },
            auth: {
              strategy: "session",
              credentials: {
                userId: `${buyer.id}`,
                scope: [buyer.role],
              },
            },
          });

          expect(repsonse.statusCode).toEqual(400);
        });
      });

      describe("when the deposited amount is of the accepted denominations", () => {
        it("adds to the deposit of the user", async () => {
          const repsonse = await server.inject({
            method: "POST",
            url: "/deposit",
            payload: {
              deposit: 5,
            },
            auth: {
              strategy: "session",
              credentials: {
                userId: `${buyer.id}`,
                scope: [buyer.role],
              },
            },
          });

          expect(repsonse.statusCode).toEqual(200);
          expect(repsonse.result).toEqual({ deposit: 10 });
        });
      });
    });
  });
});
