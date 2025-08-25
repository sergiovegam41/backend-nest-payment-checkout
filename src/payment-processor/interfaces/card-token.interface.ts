/**
 * Interface for card tokenization request - Internal use only
 * Used to communicate with Wompi tokenization endpoint
 */
export interface CardTokenRequest {
  number: string;
  exp_month: string;
  exp_year: string;
  cvc: string;
  card_holder: string;
}

/**
 * Interface for card tokenization response from Wompi
 */
export interface CardTokenResponse {
  status: string;
  data: {
    id: string;
    created_at: string;
    brand: string;
    name: string;
    last_four: string;
    bin: string;
    exp_year: string;
    exp_month: string;
    card_holder: string;
    created_with_cvc: boolean;
    expires_at: string;
    validity_ends_at: string;
  };
}