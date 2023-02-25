import { PrismaClient } from "@prisma/client";
import {
  ProductCreationInput,
  ProductUpdateInput,
} from "../interfaces/Product";

class ProductsRepository {
  prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  findUniqeById(productId: number) {
    return this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });
  }

  create(payload: ProductCreationInput) {
    return this.prisma.product.create({
      data: {
        ...payload,
      },
    });
  }

  update(productId: number, payload: ProductUpdateInput) {
    return this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...payload,
      },
    });
  }

  delete(productId: number) {
    return this.prisma.product.delete({
      where: {
        id: productId,
      },
    });
  }
}

export default ProductsRepository;
