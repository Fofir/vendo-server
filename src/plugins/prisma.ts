import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }
}

const prismaPlugin: Hapi.Plugin<{ db: string }> = {
  name: "prisma",
  register: async function (server: Hapi.Server, options) {
    const prisma = new PrismaClient({
      datasources: { db: { url: options.db } },
      log: ["error", "warn"],
    });

    try {
      await prisma.$connect();
    } catch (connectionError) {
      console.error(connectionError);
    }

    server.app.prisma = prisma;

    server.ext({
      type: "onPostStop",
      method: async (server: Hapi.Server) => {
        server.app.prisma.$disconnect();
      },
    });
  },
};

export default prismaPlugin;
