import { Product as PrismaProduct } from "@prisma/client";

export type Product = PrismaProduct;

export type ProductCreationPayload = Pick<
  Product,
  "amountAvailable" | "cost" | "productName"
>;

export type ProductCreationInput = Pick<
  Product,
  "amountAvailable" | "cost" | "productName" | "sellerId"
>;

export type ProductUpdatePayload = Pick<
  Product,
  "amountAvailable" | "cost" | "productName"
>;

export type ProductUpdateInput = ProductUpdatePayload;
