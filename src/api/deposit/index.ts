import Hapi from "@hapi/hapi";
import { deposit } from "./handlers";
import { depositPayloadSchema } from "./validators";
import { UserRole } from "@prisma/client";

const register = async function (server: Hapi.Server) {
  server.route([
    {
      method: "POST",
      path: "/deposit",
      options: {
        description: "Deposits amoutns for a buyer user",
        validate: {
          payload: depositPayloadSchema,
        },
        auth: {
          strategy: "session",
          scope: UserRole.BUYER,
        },
        tags: ["api", "deposit"],
        handler: deposit,
      },
    },
  ]);
};

const authApiPlugin = {
  register,
  name: "depositApi",
};

export default authApiPlugin;
