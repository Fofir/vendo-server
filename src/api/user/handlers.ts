import { ResponseToolkit } from "@hapi/hapi";
import { conflict, unauthorized } from "@hapi/boom";
import { IRequest } from "../../interfaces/server";

export const getUser = async (request: IRequest, h: ResponseToolkit) => {
  const {
    server: {
      plugins: {
        services: { usersService },
      },
    },

    auth: { credentials },
  } = request;

  const user = await usersService.findUniqeById(
    parseInt(credentials.userId, 10) // IDs stored in the credentials object are srings
  );

  if (!user) {
    return unauthorized();
  }

  return user;
};

export const registerUser = async (request: IRequest, h: ResponseToolkit) => {
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

  const existingUser = await usersService.findUniqeByUsername(username);

  if (existingUser) {
    throw conflict("USERNAME_TAKEN");
  }

  try {
    const user = await usersService.createBuyerUser({
      username,
      password,
    });

    if (!user) {
      return unauthorized();
    }

    request.cookieAuth.set({ id: user.id });
    return h.response(user).code(201);
  } catch (err: any) {
    return unauthorized(err.message);
  }
};
