-- CreateTable
CREATE TABLE "Player" (
    "id" VARCHAR NOT NULL,
    "lastNetId" INTEGER DEFAULT -1,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentWorld" TEXT,
    "lastWorlds" TEXT[],

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "World" (
    "id" VARCHAR NOT NULL,
    "name" TEXT NOT NULL,
    "blockCount" INTEGER NOT NULL DEFAULT 6000,
    "witdh" INTEGER NOT NULL DEFAULT 100,
    "height" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerCount" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "admins" TEXT[],

    CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldBlock" (
    "id" VARCHAR NOT NULL,
    "worldId" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "fg" INTEGER NOT NULL,
    "bg" INTEGER NOT NULL,
    "lock" JSONB,
    "sign" JSONB,
    "door" JSONB,
    "rotatedLeft" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorldBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_lastNetId_key" ON "Player"("lastNetId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- AddForeignKey
ALTER TABLE "WorldBlock" ADD CONSTRAINT "WorldBlock_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
