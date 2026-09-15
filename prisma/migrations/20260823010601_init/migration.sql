-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EventConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "eventDate" TEXT NOT NULL DEFAULT '2027-01-30',
    "venueName" TEXT NOT NULL DEFAULT 'Por confirmar',
    "venueAddress" TEXT NOT NULL DEFAULT '',
    "venueMapUrl" TEXT NOT NULL DEFAULT '',
    "ceremonyTime" TEXT NOT NULL DEFAULT '16:00',
    "receptionTime" TEXT NOT NULL DEFAULT '19:00',
    "itinerary" TEXT NOT NULL DEFAULT '[]',
    "primaryDeadline" TEXT,
    "secondaryDeadline" TEXT,
    "coverImageUrl" TEXT NOT NULL DEFAULT '',
    "galleryImages" TEXT NOT NULL DEFAULT '[]',
    "dressCode" TEXT NOT NULL DEFAULT 'Formal',
    "additionalInfo" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titularName" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deadlineType" TEXT NOT NULL DEFAULT 'PRIMARY',
    "notes" TEXT,
    "autoRejectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InvitedPerson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isChild" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InvitedPerson_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeddingTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tableNumber" INTEGER NOT NULL,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "TableAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tableId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "seatNumber" INTEGER,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TableAssignment_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "WeddingTable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TableAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "InvitedPerson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TableAssignment_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingTable_tableNumber_key" ON "WeddingTable"("tableNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TableAssignment_personId_key" ON "TableAssignment"("personId");
