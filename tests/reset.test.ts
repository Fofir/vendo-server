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
        username: "JRR Tolkein",
        password: "middleearthforver",
        deposit: 0,
        role: "SELLER",
      },
    });

    buyer = await prisma.user.create({
      data: {
        username: "JRR Martin",
        password: "westerosforever",
        deposit: 5,
        role: "BUYER",
      },
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("POST /reset", () => {
    describe("when the user is not autehnticated", () => {
      it("fails", async () => {
        const repsonse = await server.inject({
          method: "POST",
          url: "/reset",
        });

        expect(repsonse.statusCode).toEqual(401);
      });
    });

    describe("when the user is not a buyer", () => {
      it("fails", async () => {
        const repsonse = await server.inject({
          method: "POST",
          url: "/reset",
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
      it("resets the deposit of the user", async () => {
        const repsonse = await server.inject({
          method: "POST",
          url: "/reset",
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
        expect(repsonse.result).toEqual({ change: [5] });
      });
    });
  });
});
