/*
  Warnings:

  - Added the required column `categoryId` to the `MenuItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

-- Создаем временную категорию "Без категории"
INSERT INTO "MenuCategory" ("name", "description", "createdById")
SELECT 'Без категории', 'Блюда без определенной категории', "id"
FROM "User"
WHERE "role" = 'MANAGER'
LIMIT 1;

-- Добавляем поле categoryId в MenuItem
ALTER TABLE "MenuItem" ADD COLUMN "categoryId" INTEGER;

-- Обновляем существующие блюда, присваивая им временную категорию
UPDATE "MenuItem"
SET "categoryId" = (SELECT "id" FROM "MenuCategory" WHERE "name" = 'Без категории' LIMIT 1);

-- Делаем categoryId обязательным
ALTER TABLE "MenuItem" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
