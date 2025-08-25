/**
 * Interface for transaction request - Internal use only
 * Used to communicate with Wompi transactions endpoint
 */
export interface TransactionRequest {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  reference: string;
  payment_method: {
    type: string;
    token: string;
    installments: number;
  };
  acceptance_token: string;
  signature: string;
}

/**
 * Interface for transaction response from Wompi
 */
export interface TransactionResponse {
  data: {
    id: string;
    amount_in_cents: number;
    reference: string;
    customer_email: string;
    currency: string;
    payment_method_type: string;
    payment_method: {
      type: string;
      extra: {
        bin: string;
        name: string;
        brand: string;
        exp_year: string;
        exp_month: string;
        last_four: string;
        card_holder: string;
        is_three_ds: boolean;
      };
    };
    status: string;
    status_message: string;
    created_at: string;
    finalized_at: string;
    amount_refunded: number;
    shipping_address?: any;
    billing_data?: any;
    taxes?: Array<{
      type: string;
      amount_in_cents: number;
    }>;
  };
}