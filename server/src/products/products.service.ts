import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  async getProducts() {
    return {
      id: 1,
      name: 'iphone',
    };
  }
}
