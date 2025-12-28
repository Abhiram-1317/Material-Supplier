-- CreateEnum
CREATE TYPE "OrderSlaStatus" AS ENUM ('NOT_APPLICABLE', 'ON_TIME', 'LATE');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "dispatchedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledDate" TIMESTAMP(3),
ADD COLUMN     "slaStatus" "OrderSlaStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "slotLabel" TEXT;

-- CreateTable
CREATE TABLE "SupplierSlotConfig" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "maxOrdersPerDay" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierSlotConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupplierSlotConfig_supplierId_label_key" ON "SupplierSlotConfig"("supplierId", "label");

-- AddForeignKey
ALTER TABLE "SupplierSlotConfig" ADD CONSTRAINT "SupplierSlotConfig_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
