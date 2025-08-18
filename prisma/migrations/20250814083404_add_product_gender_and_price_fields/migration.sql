-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNISEX');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountAmount" DOUBLE PRECISION,
ADD COLUMN     "discountRate" DOUBLE PRECISION,
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'UNISEX',
ADD COLUMN     "originalPrice" DOUBLE PRECISION;
