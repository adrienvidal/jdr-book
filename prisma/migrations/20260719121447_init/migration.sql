-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "passe" TEXT NOT NULL DEFAULT '',
    "force" INTEGER NOT NULL DEFAULT 10,
    "forceMax" INTEGER NOT NULL DEFAULT 10,
    "dex" INTEGER NOT NULL DEFAULT 10,
    "dexMax" INTEGER NOT NULL DEFAULT 10,
    "vol" INTEGER NOT NULL DEFAULT 10,
    "volMax" INTEGER NOT NULL DEFAULT 10,
    "pv" INTEGER NOT NULL DEFAULT 1,
    "pvMax" INTEGER NOT NULL DEFAULT 1,
    "armure" INTEGER NOT NULL DEFAULT 0,
    "sous" INTEGER NOT NULL DEFAULT 0,
    "epuise" BOOLEAN NOT NULL DEFAULT false,
    "fatigue" INTEGER NOT NULL DEFAULT 0,
    "traits" TEXT NOT NULL DEFAULT '',
    "liens" TEXT NOT NULL DEFAULT '',
    "presages" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slots" INTEGER NOT NULL DEFAULT 1,
    "kind" TEXT NOT NULL DEFAULT 'equipement',
    "degats" TEXT,
    "armorValue" INTEGER,
    "uses" INTEGER,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
