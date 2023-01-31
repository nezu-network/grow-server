-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "lastNetId" INTEGER DEFAULT -1,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Player_lastNetId_key" ON "Player"("lastNetId");
