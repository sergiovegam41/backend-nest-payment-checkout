-- CreateTable
CREATE TABLE "public"."payments" (
    "id" UUID NOT NULL,
    "amount_in_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'wompi',
    "provider_payment_id" TEXT,
    "payment_url" TEXT,
    "name" TEXT,
    "description" TEXT,
    "single_use" BOOLEAN NOT NULL DEFAULT true,
    "collect_shipping" BOOLEAN NOT NULL DEFAULT false,
    "raw_response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_payment_id_key" ON "public"."payments"("provider_payment_id");

-- CreateIndex
CREATE INDEX "payments_provider_payment_id_idx" ON "public"."payments"("provider_payment_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "public"."payments"("status");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "public"."payments"("created_at");
