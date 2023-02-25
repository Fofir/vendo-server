import { PrismaClient } from "@prisma/client";
import { createServer } from "../app/server";
import { IServer } from "../src/interfaces/server";
import { clearDb } from "./test-helpers";
import { User } from "../src/interfaces/user";

describe("User API", () => {
  let server: IServer;
  let prisma: PrismaClient;

  beforeAll(async () => {
    server = await createServer();
    prisma = server.app.prisma;
    await clearDb(prisma);
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("POST /user", () => {
    describe("when the username is available", () => {
      it("creates a new user and returns", async () => {
        const response = await server.inject({
          method: "POST",
          url: "/user",
          payload: {
            username: "bilbo23",
            password: "secret-password",
          },
        });

        expect(response.statusCode).toEqual(201);

        const sessionCookie = response.headers["set-cookie"][0];
        expect(sessionCookie).toMatch(
          /vendo_dev-api-session-local=.+Max-Age=604800; Expires=.*; HttpOnly; SameSite=None; Path=\//
        );

        expect(response.result).toEqual(
          expect.objectContaining({
            username: "bilbo23",
            deposit: 0,
            id: expect.any(Number),
            role: "BUYER",
          })
        );
      });
    });

    describe("when the payload is missing a username", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "POST",
          url: "/user",
          payload: { password: "some-secret" },
        });

        expect(response.statusCode).toEqual(400);
        expect(response.result).toEqual({
          error: "Bad Request",
          message: "Invalid request payload input",
          statusCode: 400,
        });
      });
    });

    describe("when the payload is missing a password", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "POST",
          url: "/user",
          payload: { username: "samwise2" },
        });

        expect(response.statusCode).toEqual(400);
        expect(response.result).toEqual({
          error: "Bad Request",
          message: "Invalid request payload input",
          statusCode: 400,
        });
      });
    });

    describe("when the username is unavailable", () => {
      beforeAll(async () => {
        await prisma.user.create({
          data: {
            username: "frodo22",
            password: "secret-password",
            role: "BUYER",
            deposit: 0,
          },
        });
      });

      it("fails", async () => {
        const response = await server.inject({
          method: "POST",
          url: "/user",
          payload: { username: "frodo22", password: "other-secret-password" },
        });

        expect(response.statusCode).toEqual(409);
        expect(response.result).toEqual({
          error: "Conflict",
          message: "USERNAME_TAKEN",
          statusCode: 409,
        });
      });
    });
  });

  describe("GET /user", () => {
    describe("when requester is not authenticated", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "GET",
          url: "/user",
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
      let user: User;
      beforeAll(async () => {
        user = await prisma.user.create({
          data: {
            username: "gandalf22",
            password: "you-shall-not-pass",
            role: "BUYER",
            deposit: 0,
          },
        });
      });

      it("returns information about the current user", async () => {
        const response = await server.inject({
          method: "GET",
          url: "/user",
          auth: {
            strategy: "session",
            credentials: {
              // Hapi types state clearly that the userId in the credentials object needs to be a string
              userId: `${user.id}`,
            },
          },
        });

        expect(response.statusCode).toEqual(200);
        expect(response.result).toEqual(
          expect.objectContaining({
            deposit: 0,
            id: expect.any(Number),
            role: "BUYER",
            username: "gandalf22",
          })
        );
      });
    });

    describe("when requester is authenticated but the user does not exist", () => {
      it("returns information about the current user", async () => {
        const response = await server.inject({
          method: "GET",
          url: "/user",
          auth: {
            strategy: "session",
            credentials: {
              // Hapi types state clearly that the userId in the credentials object needs to be a string
              userId: "28395902",
            },
          },
        });

        expect(response.statusCode).toEqual(401);
        expect(response.result).toEqual({
          error: "Unauthorized",
          message: "Unauthorized",
          statusCode: 401,
        });
      });
    });
  });
});
