export interface ICheckoutValidator {
  validateProducts(productIds: string[]): Promise<void>;
  validateQuantities(quantities: number[]): Promise<void>;
  validateStock(productIds: string[], quantities: number[]): Promise<void>;
}