import Hapi from "@hapi/hapi";
import { getUser, registerUser } from "./handlers";
import { createUserPayloadSchema } from "./validators";

const register = async function (server: Hapi.Server) {
  server.route([
    {
      method: "POST",
      path: "/user",
      options: {
        description: "Registers a new user",
        validate: {
          payload: createUserPayloadSchema,
        },
        auth: false,
        tags: ["api", "user"],
        handler: registerUser,
      },
    },
    {
      method: "GET",
      path: "/user",
      options: {
        description: "Retrieves information about the current session user",
        auth: "session",
        tags: ["api", "user"],
        handler: getUser,
      },
    },
  ]);
};

const userApiPlugin = {
  register,
  name: "userApi",
};

export default userApiPlugin;
