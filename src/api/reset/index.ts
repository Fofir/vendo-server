import Hapi from "@hapi/hapi";
import { reset } from "./handlers";
import { UserRole } from "@prisma/client";

const register = async function (server: Hapi.Server) {
  server.route([
    {
      method: "POST",
      path: "/reset",
      options: {
        description: "Resets the deposit of the requesting user",
        auth: {
          strategy: "session",
          scope: UserRole.BUYER,
        },
        tags: ["api", "reset"],
        handler: reset,
      },
    },
  ]);
};

const resetApiPlugin = {
  register,
  name: "resetApi",
};

export default resetApiPlugin;
