import {
  ProductCreationInput,
  ProductUpdateInput,
} from "../interfaces/Product";
import ProductsRepository from "../repositories/ProductsRepository";

class ProductsService {
  productsRepository: ProductsRepository;
  constructor({
    productsRepository,
  }: {
    productsRepository: ProductsRepository;
  }) {
    this.productsRepository = productsRepository;
  }

  findUniqeById(productId: number) {
    return this.productsRepository.findUniqeById(productId);
  }

  create(payload: ProductCreationInput) {
    return this.productsRepository.create(payload);
  }

  update(productId: number, payload: ProductUpdateInput) {
    return this.productsRepository.update(productId, payload);
  }

  async isProductOwnedBySeller(productId: number, userId: number) {
    const prouct = await this.productsRepository.findUniqeById(productId);

    return prouct?.sellerId === userId;
  }

  delete(productId: number) {
    return this.productsRepository.delete(productId);
  }
}

export default ProductsService;
