import { ResponseToolkit } from "@hapi/hapi";
import { IRequest } from "../../interfaces/server";

export const deposit = async (request: IRequest) => {
  const {
    payload,
    server: {
      plugins: {
        services: { usersService },
      },
    },
    auth: { credentials },
  } = request;

  const { deposit } = payload as {
    deposit: number;
  };

  const userAfterDeposit = await usersService.depositForUserWithId(
    parseInt(credentials.userId, 10),
    deposit
  );

  return {
    deposit: userAfterDeposit.deposit,
  };
};
