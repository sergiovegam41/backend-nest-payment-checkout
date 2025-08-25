-- CreateEnum
CREATE TYPE "public"."CheckoutStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."checkouts" (
    "id" UUID NOT NULL,
    "total" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "taxes" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "status" "public"."CheckoutStatus" NOT NULL DEFAULT 'PENDING',
    "paymentUrl" TEXT,
    "providerPaymentId" TEXT,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."checkout_items" (
    "id" UUID NOT NULL,
    "checkoutId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,

    CONSTRAINT "checkout_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "checkouts_status_idx" ON "public"."checkouts"("status");

-- CreateIndex
CREATE INDEX "checkouts_providerPaymentId_idx" ON "public"."checkouts"("providerPaymentId");

-- CreateIndex
CREATE INDEX "checkouts_createdAt_idx" ON "public"."checkouts"("createdAt");

-- CreateIndex
CREATE INDEX "checkout_items_checkoutId_idx" ON "public"."checkout_items"("checkoutId");

-- CreateIndex
CREATE INDEX "checkout_items_productId_idx" ON "public"."checkout_items"("productId");

-- AddForeignKey
ALTER TABLE "public"."checkout_items" ADD CONSTRAINT "checkout_items_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."checkouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."checkout_items" ADD CONSTRAINT "checkout_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
