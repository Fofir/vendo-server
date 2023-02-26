import Hapi, { Server } from "@hapi/hapi";
import hapiCookie from "@hapi/cookie";
import path from "path";
import prismaPlugin from "../src/plugins/prisma";
import config, { nodeEnv } from "../config";
import servicesPlugin from "../src/plugins/services";
import authPlugin from "../src/plugins/auth";
import authApi from "../src/api/auth";
import userApi from "../src/api/user";
import productApi from "../src/api/product";
import depositApi from "../src/api/deposit";
import buyApi from "../src/api/buy";
import resetApi from "../src/api/reset";
import { IServer } from "../src/interfaces/server";
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const HapiSwagger = require("hapi-swagger");

const printServerRoutes = (server: Server) => {
  console.log("==> Server routes");
  server.table().forEach((route) => {
    const routeTitle = `${route.method.toUpperCase()} ${route.path}`;
    console.log("   *", routeTitle);
  });
};
const swaggerOptions = {
  info: {
    title: "Vendo API",
  },
};

const server = Hapi.server({
  port: config.port,
  host: config.host,
  debug: config.debug ? { request: ["error"], log: ["error"] } : false,
  routes: {
    files: {
      relativeTo: path.join(__dirname, "../public"),
    },
    cors: {
      origin: [config.allowedOrigin],
      credentials: true,
      additionalHeaders: [
        "cache-control",
        "x-requested-with",
        "Access-Control-Allow-Origin",
      ],
    },
  },
}) as IServer;

export async function createServer(): Promise<IServer> {
  const dbString = config.db;

  if (!dbString) {
    throw new Error("Missing DB connection string");
  }

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
    { plugin: hapiCookie },
    { plugin: prismaPlugin, options: { db: dbString } },
    {
      plugin: servicesPlugin,
    },
    {
      plugin: authPlugin,
      options: {
        cookieName: config.cookieName,
        cookiePassword: config.cookiePassword,
        isCookieSecure: config.isCookieSecure,
        isCookieSameSite: config.isCookieSameSite,
      },
    },
    {
      plugin: authApi,
    },
    {
      plugin: userApi,
    },
    {
      plugin: productApi,
    },
    {
      plugin: depositApi,
    },
    {
      plugin: buyApi,
    },
    {
      plugin: resetApi,
    },
  ]);

  server.route([
    {
      method: "GET",
      path: "/health",
      options: {
        auth: false,
      },
      handler: async (_request, h) => {
        return h
          .response({
            healthy: true,
          })
          .code(200);
      },
    },
  ]);

  await server.initialize();

  if (nodeEnv === "development") {
    printServerRoutes(server);
  }

  return server;
}

export async function startServer(server: Hapi.Server): Promise<Hapi.Server> {
  await server.start();
  console.log("info", `Server running on ${server.info.uri}`);
  server.log("info", `Server running on ${server.info.uri}`);
  return server;
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
