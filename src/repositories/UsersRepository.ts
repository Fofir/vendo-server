import { PrismaClient, UserRole } from "@prisma/client";

class UsersRepository {
  prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  createBuyerUser({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    return this.prisma.user.create({
      data: {
        username,
        password,
        role: UserRole.BUYER,
        deposit: 0,
      },
    });
  }

  findUniqeById(userId: number) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  findUniqeByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  depositForUserWithId(userId: number, deposit: number) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deposit: {
          increment: deposit,
        },
      },
    });
  }

  resetDepositForUserWithId(userId: number) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deposit: 0,
      },
    });
  }
}

export default UsersRepository;
