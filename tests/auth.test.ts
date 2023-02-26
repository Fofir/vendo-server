import { PrismaClient } from "@prisma/client";
import { createServer } from "../app/server";
import { IServer } from "../src/interfaces/server";
import { clearDb } from "./test-helpers";
import { User } from "../src/interfaces/user";

describe("Auth API", () => {
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

  describe("POST /auth/login", () => {
    describe("when the user with the credentials does not exist", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "POST",
          url: "/auth/login",
          payload: {
            username: "bilbo23",
            password: "secret-password",
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

    describe("when the payload is missing a username", () => {
      it("fails", async () => {
        const response = await server.inject({
          method: "POST",
          url: "/auth/login",
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
          url: "/auth/login",
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

    describe("when the user with the credentials exists", () => {
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

      it("creates a session and returns information about the user", async () => {
        const response = await server.inject({
          method: "POST",
          url: "/auth/login",
          payload: { username: "frodo22", password: "other-secret-password" },
        });

        expect(response.statusCode).toEqual(200);

        const sessionCookie = response.headers["set-cookie"][0];
        expect(sessionCookie).toMatch(
          /vendo_dev-api-session-local=.+Max-Age=604800; Expires=.*; HttpOnly; Path=\//
        );

        expect(response.result).toEqual(
          expect.objectContaining({
            deposit: 0,
            id: expect.any(Number),
            role: "BUYER",
            username: "frodo22",
          })
        );
      });
    });
  });

  describe("POST /auth/logout", () => {
    let user: User;
    beforeAll(async () => {
      user = await prisma.user.create({
        data: {
          username: "gimly22",
          password: "burburbrurbrur",
          role: "BUYER",
          deposit: 0,
        },
      });
    });

    it("deletes the session cookie for an authenticated user", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/logout",
        auth: {
          strategy: "session",
          credentials: {
            // Hapi types state clearly that the userId in the credentials object needs to be a string
            userId: `${user.id}`,
          },
        },
      });

      expect(response.statusCode).toEqual(200);

      const sessionCookie = response.headers["set-cookie"][0];
      expect(sessionCookie).toMatch(
        /vendo_dev-api-session-local=; Max-Age=0; Expires=.*; HttpOnly; Path=\//
      );
    });
  });
});
