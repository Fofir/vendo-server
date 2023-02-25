import Hapi from "@hapi/hapi";
import ProductsService from "../services/ProductsService";
import ProductsRepository from "../repositories/ProductsRepository";
import UsersService from "../services/UsersService";
import UsersRepository from "../repositories/UsersRepository";

export type PluginInterface = {
  services: {
    productsService: ProductsService;
    usersService: UsersService;
  };
};

const servicesPlugin: Hapi.Plugin<{}> = {
  name: "services",
  dependencies: ["prisma"],
  register: async function (server: Hapi.Server) {
    const prisma = server.app.prisma;

    server.expose({
      productsService: new ProductsService({
        productsRepository: new ProductsRepository({ prisma }),
      }),
      usersService: new UsersService({
        usersRepository: new UsersRepository({ prisma }),
      }),
    });
  },
};

export default servicesPlugin;
