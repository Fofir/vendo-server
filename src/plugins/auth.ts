import Hapi from "@hapi/hapi";
import Joi from "joi";
import { IRequest } from "../interfaces/server";

declare module "@hapi/hapi" {
  interface AuthCredentials {
    userId: string;
  }

  interface ServerApplicationState {}
}

interface AuthPluginOptions {
  cookieName: string;
  cookiePassword: string;
  isCookieSecure: boolean;
  isCookieSameSite: boolean;
  taskAuthenticationToken: string;
}

const authPluginOptionsSchema = Joi.object({
  cookieName: Joi.string().required(),
  cookiePassword: Joi.string().length(32).required(),
  isCookieSecure: Joi.boolean().default(true),
  isCookieSameSite: Joi.boolean().required(),
});

const authPlugin: Hapi.Plugin<AuthPluginOptions> = {
  name: "auth",
  dependencies: ["services"],
  register: async function (server: Hapi.Server, options) {
    authPluginOptionsSchema.validateAsync(options);
    const { cookieName, cookiePassword, isCookieSecure, isCookieSameSite } =
      options;

    const validate = async (request: IRequest, session: any) => {
      if (!session) {
        return { isValid: false };
      }

      const {
        server: {
          plugins: {
            services: { usersService },
          },
        },
      } = request;

      const userId = session?.id;
      const user = await usersService.findUniqeById(userId);

      if (!user) {
        return { isValid: false };
      }

      return {
        isValid: true,
        credentials: { userId: user.id, scope: [user.role] },
      };
    };

    server.auth.strategy("session", "cookie", {
      cookie: {
        name: cookieName,
        password: cookiePassword,
        isSecure: isCookieSecure,
        ttl: 7 * 24 * 60 * 60 * 1000, // a week
        isHttpOnly: true,
        path: "/",
        isSameSite: isCookieSameSite ? "Strict" : false,
      },
      validate,
    });

    server.auth.default("session");
  },
};

export default authPlugin;
