/*
  Warnings:

  - The primary key for the `product_images` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `product_images` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productId` on the `product_images` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."product_images" DROP CONSTRAINT "product_images_productId_fkey";

-- AlterTable
ALTER TABLE "public"."product_images" DROP CONSTRAINT "product_images_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" UUID NOT NULL,
ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."products" DROP CONSTRAINT "products_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "product_images_productId_idx" ON "public"."product_images"("productId");

-- CreateIndex
CREATE INDEX "product_images_productId_position_idx" ON "public"."product_images"("productId", "position");

-- AddForeignKey
ALTER TABLE "public"."product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
