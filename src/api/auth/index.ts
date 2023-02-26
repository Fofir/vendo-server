import Hapi from "@hapi/hapi";
import { login, logout } from "./handlers";
import { loginUserPayloadSchema } from "./validators";

const register = async function (server: Hapi.Server) {
  server.route([
    {
      method: "POST",
      path: "/auth/login",
      options: {
        auth: false,
        description: "Validates user credentials and starts a session",
        tags: ["api"],
        validate: {
          payload: loginUserPayloadSchema,
        },
        handler: login,
      },
    },
    {
      method: "POST",
      path: "/auth/logout",
      options: {
        description: "Deletes an existing user session",
        auth: "session",
        tags: ["api"],
        handler: logout,
      },
    },
  ]);
};

const authApiPlugin = {
  register,
  name: "authApi",
};

export default authApiPlugin;
