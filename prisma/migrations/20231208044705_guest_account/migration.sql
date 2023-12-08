-- DropIndex
DROP INDEX "Player_email_key";

-- DropIndex
DROP INDEX "Player_name_key";

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "mac" TEXT,
ADD COLUMN     "requestedName" TEXT,
ADD COLUMN     "tag" INTEGER,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
