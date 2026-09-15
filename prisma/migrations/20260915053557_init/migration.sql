-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventConfig" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "eventDate" TEXT NOT NULL DEFAULT '2027-01-30',
    "venueName" TEXT NOT NULL DEFAULT 'Por confirmar',
    "venueAddress" TEXT NOT NULL DEFAULT '',
    "venueMapUrl" TEXT NOT NULL DEFAULT '',
    "venueLat" TEXT NOT NULL DEFAULT '18.8994602',
    "venueLng" TEXT NOT NULL DEFAULT '-99.2137462',
    "ceremonyTime" TEXT NOT NULL DEFAULT '16:00',
    "receptionTime" TEXT NOT NULL DEFAULT '19:00',
    "itinerary" TEXT NOT NULL DEFAULT '[]',
    "primaryDeadline" TEXT,
    "secondaryDeadline" TEXT,
    "coverImageUrl" TEXT NOT NULL DEFAULT '',
    "galleryImages" TEXT NOT NULL DEFAULT '[]',
    "dressCode" TEXT NOT NULL DEFAULT 'Formal',
    "additionalInfo" TEXT NOT NULL DEFAULT '',
    "blessingText" TEXT NOT NULL DEFAULT 'Con la bendición de Dios y de nuestras familias, hemos decidido unir nuestras vidas. Será un honor contar con su presencia en este día tan especial.',
    "monogramImageUrl" TEXT NOT NULL DEFAULT '',
    "brideFatherName" TEXT NOT NULL DEFAULT 'Rodolfo De los Santos Gilbón',
    "brideMotherName" TEXT NOT NULL DEFAULT 'Belem Sedano Ortega',
    "groomFatherName" TEXT NOT NULL DEFAULT 'Héctor Leonardo Martínez Solís',
    "groomMotherName" TEXT NOT NULL DEFAULT 'Rafaela Flores De los Santos',
    "dressCodeDetail" TEXT NOT NULL DEFAULT 'Vestido largo para ellas, traje formal para ellos. Les pedimos amablemente reservar para la novia los tonos que se muestran a continuación.',
    "prohibitedColors" TEXT NOT NULL DEFAULT '[{"name":"Blanco","hex":"#ffffff"},{"name":"Vino","hex":"#61081b"}]',
    "giftMessage" TEXT NOT NULL DEFAULT 'Si deseas contribuir de alguna manera, estamos ahorrando para algo especial. Si gustas, tu aporte en efectivo sería genial. No te preocupes, el sobre estará en la mesa.',
    "noticeTitle" TEXT NOT NULL DEFAULT 'Cuidado del recinto',
    "noticeText" TEXT NOT NULL DEFAULT 'Con el fin de preservar este hermoso espacio donde compartiremos un día tan especial, agradecemos a los padres y tutores su apoyo supervisando a los menores en todo momento. Les recordamos que cualquier daño ocasionado a las instalaciones, mobiliario u objetos del recinto deberá ser cubierto por la persona responsable.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "titularName" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deadlineType" TEXT NOT NULL DEFAULT 'PRIMARY',
    "notes" TEXT,
    "guestMessage" TEXT,
    "autoRejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitedPerson" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isChild" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvitedPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingTable" (
    "id" TEXT NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "name" TEXT,

    CONSTRAINT "WeddingTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableAssignment" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "seatNumber" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TableAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingTable_tableNumber_key" ON "WeddingTable"("tableNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TableAssignment_personId_key" ON "TableAssignment"("personId");

-- AddForeignKey
ALTER TABLE "InvitedPerson" ADD CONSTRAINT "InvitedPerson_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableAssignment" ADD CONSTRAINT "TableAssignment_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "WeddingTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableAssignment" ADD CONSTRAINT "TableAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "InvitedPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableAssignment" ADD CONSTRAINT "TableAssignment_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
