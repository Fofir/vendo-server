import { ResponseToolkit } from "@hapi/hapi";
import { IRequest } from "../../interfaces/server";
import { badRequest, boomify, notFound } from "@hapi/boom";

export const reset = async (request: IRequest) => {
  const {
    payload,
    server: {
      plugins: {
        services: { usersService },
      },
    },
    auth: { credentials },
  } = request;

  try {
    const { change } = await usersService.resetDepositForUserWithId(
      parseInt(credentials.userId, 10)
    );

    return {
      change,
    };
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === usersService.errors.USER_NOT_FOUND) {
        return notFound(err.message);
      }

      return boomify(err);
    }
  }
};
