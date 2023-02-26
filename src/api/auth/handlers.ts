import { ResponseToolkit } from "@hapi/hapi";
import { unauthorized } from "@hapi/boom";
import bcrypt from "bcryptjs";
import { omit } from "lodash";
import { IRequest } from "../../interfaces/server";

export const login = async (request: IRequest, h: ResponseToolkit) => {
  const {
    payload,
    server: {
      plugins: {
        services: { usersService },
      },
    },
  } = request;

  const { username, password } = payload as {
    username: string;
    password: string;
  };

  try {
    const user = await usersService.findUniqeByUsername(username);

    if (!user || !user.password) {
      return unauthorized();
    }

    await bcrypt.compare(password, user.password);

    request.cookieAuth.set({ id: user.id });
    return omit(user, ["password"]);
  } catch (err: any) {
    return unauthorized(err.message);
  }
};

export const logout = async (request: IRequest) => {
  const { cookieAuth } = request;

  cookieAuth.clear();
  return {};
};
