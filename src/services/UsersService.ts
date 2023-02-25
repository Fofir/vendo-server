import bcrypt from "bcryptjs";
import UsersRepository from "../repositories/UsersRepository";
import { omit } from "lodash";
import { UserWithoutPassword } from "../interfaces/user";

class UsersService {
  usersRepository: UsersRepository;

  errors = {
    INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
    USER_NOT_FOUND: "USER_NOT_FOUND",
  };

  acceptedDenominations = [100, 50, 20, 10, 5];

  constructor({ usersRepository }: { usersRepository: UsersRepository }) {
    this.usersRepository = usersRepository;
  }

  async findUniqeById(userId: number) {
    const user = await this.usersRepository.findUniqeById(userId);
    return user ? (omit(user, ["password"]) as UserWithoutPassword) : null;
  }

  findUniqeByUsername(username: string) {
    return this.usersRepository.findUniqeByUsername(username);
  }

  static async hashPassword(password: string) {
    const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    return hash;
  }

  async createBuyerUser({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    const hashedPassword = await UsersService.hashPassword(password);

    const user = await this.usersRepository.createBuyerUser({
      username,
      password: hashedPassword,
    });

    return user ? (omit(user, ["password"]) as UserWithoutPassword) : user;
  }

  depositForUserWithId(userId: number, deposit: number) {
    return this.usersRepository.depositForUserWithId(userId, deposit);
  }

  parseChangeToDenominations(change: number) {
    const { acceptedDenominations } = this;

    const changeArr = [];

    let rest = change;

    for (let i = 0; i < acceptedDenominations.length; i += 1) {
      const denomination = acceptedDenominations[i];

      if (rest >= denomination) {
        rest -= denomination;
        changeArr.push(denomination);
      }
    }

    return changeArr;
  }

  async subtractFundForUserWithId(userId: number, value: number) {
    const user = await this.usersRepository.findUniqeById(userId);
    if (!user) {
      throw new Error(this.errors.USER_NOT_FOUND);
    }

    const { deposit } = user;

    if (value > deposit) {
      throw new Error(this.errors.INSUFFICIENT_FUNDS);
    }

    const change = deposit - value;

    await this.usersRepository.resetDepositForUserWithId(userId);

    return {
      change: this.parseChangeToDenominations(change),
      spent: value,
    };
  }
}

export default UsersService;
