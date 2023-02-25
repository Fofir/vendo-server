import bcrypt from "bcryptjs";
import UsersRepository from "../repositories/UsersRepository";
import { omit } from "lodash";
import { UserWithoutPassword } from "../interfaces/user";

class UsersService {
  usersRepository: UsersRepository;
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
}

export default UsersService;
