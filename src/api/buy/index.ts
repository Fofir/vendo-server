import Hapi from "@hapi/hapi";
import { buy } from "./handlers";
import { buyPayloadSchema } from "./validators";
import { UserRole } from "@prisma/client";

const register = async function (server: Hapi.Server) {
  server.route([
    {
      method: "POST",
      path: "/buy",
      options: {
        description: "Buys a product for a buyer user",
        validate: {
          payload: buyPayloadSchema,
        },
        auth: {
          strategy: "session",
          scope: UserRole.BUYER,
        },
        tags: ["api", "buy"],
        handler: buy,
      },
    },
  ]);
};

const buyApiPlugin = {
  register,
  name: "buyApi",
};

export default buyApiPlugin;
