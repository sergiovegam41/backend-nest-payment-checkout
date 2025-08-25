export interface ICheckoutCalculator {
  calculateTotal(productIds: string[], quantities?: number[]): Promise<number>;
  calculateSubtotal(productIds: string[], quantities?: number[]): Promise<number>;
  calculateTaxes(subtotal: number): Promise<number>;
}