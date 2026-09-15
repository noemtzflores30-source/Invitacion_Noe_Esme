-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EventConfig" (
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
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_EventConfig" ("additionalInfo", "ceremonyTime", "coverImageUrl", "dressCode", "eventDate", "galleryImages", "id", "itinerary", "primaryDeadline", "receptionTime", "secondaryDeadline", "updatedAt", "venueAddress", "venueMapUrl", "venueName") SELECT "additionalInfo", "ceremonyTime", "coverImageUrl", "dressCode", "eventDate", "galleryImages", "id", "itinerary", "primaryDeadline", "receptionTime", "secondaryDeadline", "updatedAt", "venueAddress", "venueMapUrl", "venueName" FROM "EventConfig";
DROP TABLE "EventConfig";
ALTER TABLE "new_EventConfig" RENAME TO "EventConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
