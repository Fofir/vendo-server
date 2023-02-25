import { PrismaClient } from "@prisma/client";

import config from "../config";
// import authTokenService from "../src/services/authTokenService";

export const generateAuthTokenForUserId = (userId: string) => {
  // return authTokenService({ jwtSecret: config.jwtSecret }).generateAuthToken({
  //   userId,
  //   scope: ["user"],
  // });
};

export const clearDb = async (prismaClient: PrismaClient) => {
  await prismaClient.product.deleteMany();
  await prismaClient.user.deleteMany();
};
