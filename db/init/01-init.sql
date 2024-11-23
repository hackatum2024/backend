CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS rental_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data TEXT NOT NULL,
    "mostSpecificRegionID" INTEGER NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "numberSeats" INTEGER NOT NULL,
    price INTEGER NOT NULL,
    "carType" TEXT NOT NULL,
    "hasVollkasko" BOOLEAN NOT NULL,
    "freeKilometers" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rental_offers_region_price ON rental_offers ("mostSpecificRegionID", price);
CREATE INDEX idx_rental_offers_dates ON rental_offers ("startDate", "endDate");
CREATE INDEX idx_rental_offers_composite ON rental_offers ("mostSpecificRegionID", "startDate", "endDate", price);
