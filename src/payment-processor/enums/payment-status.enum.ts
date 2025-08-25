export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED', 
  CANCELLED = 'CANCELLED',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED',
  ERROR = 'ERROR'
}

export enum WompiStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED', 
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED',
  ERROR = 'ERROR'
}

export const WOMPI_STATUS_MAPPING: Record<WompiStatus, PaymentStatus> = {
  [WompiStatus.PENDING]: PaymentStatus.PENDING,
  [WompiStatus.APPROVED]: PaymentStatus.APPROVED,
  [WompiStatus.DECLINED]: PaymentStatus.DECLINED,
  [WompiStatus.CANCELLED]: PaymentStatus.CANCELLED,
  [WompiStatus.VOIDED]: PaymentStatus.DECLINED,
  [WompiStatus.REFUNDED]: PaymentStatus.DECLINED,
  [WompiStatus.ERROR]: PaymentStatus.ERROR
};