-- CreateEnum
CREATE TYPE "ExchangeRefundType" AS ENUM ('EXCHANGE', 'REFUND');

-- CreateEnum
CREATE TYPE "ExchangeRefundStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED');

-- CreateTable
CREATE TABLE "ExchangeRefund" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "ExchangeRefundType" NOT NULL,
    "status" "ExchangeRefundStatus" NOT NULL DEFAULT 'PENDING',
    "applicantName" TEXT NOT NULL,
    "applicantPhone" TEXT NOT NULL,
    "applicantEmail" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "adminNotes" TEXT,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRefund_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExchangeRefund" ADD CONSTRAINT "ExchangeRefund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
