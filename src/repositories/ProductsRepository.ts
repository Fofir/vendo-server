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

  subtractAmountAvailable(productId: number, amount: number) {
    return this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        amountAvailable: {
          decrement: amount,
        },
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

  getAll(sellerId?: number) {
    return this.prisma.product.findMany({
      where: {
        sellerId,
      },
    });
  }
}

export default ProductsRepository;
