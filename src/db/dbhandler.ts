import { RentalOffer } from "./models/RentalOffers";
import { requestGetOffers, requestPostOffers } from "../schema";
import { sequelize } from "./dbconnect";
import { regionService } from "..";
import { logger } from "../utils/logger";
import { Op, fn, col, literal, QueryTypes } from "sequelize";
import { client } from "./dbconnect";
export async function getOffers(body: typeof requestGetOffers) {
  const regionIds = regionService.getSubregionIds(body.regionID);
  const query = `SELECT get_offers(
    ARRAY[${regionIds}]::integer[],
    ${body.timeRangeStart}::bigint,
    ${body.timeRangeEnd}::bigint,
    ${body.numberDays}::integer,
    '${body.sortOrder}'::text,
    ${body.page}::integer,
    ${body.pageSize}::integer,
    ${body.priceRangeWidth}::integer,
    ${body.minNumberSeats ?? "NULL"}::integer,
    ${body.minPrice ?? "NULL"}::numeric,
    ${body.maxPrice ?? "NULL"}::numeric,
    ${body.carType ? `'${body.carType}'` : "NULL"}::text,
    ${body.onlyVollkasko ?? "NULL"}::boolean,
    ${body.minFreeKilometer ?? "NULL"}::integer,
    ${body.minFreeKilometerWidth}::integer
  ) as result`;

  logger.info(`creating for body ${body} this query: ${query}`);

  const [rows] = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  // the function returns a single JSONB column, so get the 'result' field
  // typeScript type assertion since we know the structure
  return (rows as any).result;
}

export async function postOffer(body: typeof requestPostOffers) {
  console.log("POST offer");
  try {
    // Since the body contains an array of offers in the 'offers' property
    const offers = body.offers;

    // Assuming we're processing just the first offer for now
    const offerData = offers[0];

    // Convert timestamp to Date object if timestamp is provided
    const startDate = new Date(offerData.startDate);
    const endDate = new Date(offerData.endDate);

    const offer = await RentalOffer.create({
      data: offerData.data,
      mostSpecificRegionID: offerData.mostSpecificRegionID,
      startDate: startDate,
      endDate: endDate,
      numberSeats: offerData.numberSeats,
      price: offerData.price,
      carType: offerData.carType,
      hasVollkasko: offerData.hasVollkasko,
      freeKilometers: offerData.freeKilometers,
    });

    console.log("Created offer:", offer.id);
    return offer.toJSON();
  } catch (error) {
    console.error("Error creating offer:", error);
    throw error; // Re-throw the error to be handled by the route handler
  }
}

export async function cleanUp() {
  console.log("Cleaning up offers");
  try {
    await RentalOffer.destroy({
      where: {}, // empty where clause means delete all
      truncate: true, // this resets the auto-incrementing primary key
    });
    console.log("Successfully cleaned up all offers");
    return { success: true, message: "All offers have been cleaned up" };
  } catch (error) {
    console.error("Error cleaning up offers:", error);
    throw error;
  }
}

// interface for the offers returned in the first query

export async function testGet(body: typeof requestGetOffers) {
  const regionIds = regionService.getSubregionIds(body.regionID);
  // Create the base query
  let matchingOffers = `SELECT * FROM rental_offers WHERE "mostSpecificRegionID" = ANY(ARRAY[${regionIds}])`;

  // Dynamically add filters only if they are defined
  if (body.timeRangeStart !== undefined) {
    matchingOffers += ` AND "startDate" >= ${body.timeRangeStart}`;
  }

  if (body.timeRangeEnd !== undefined) {
    matchingOffers += ` AND "endDate" <= ${body.timeRangeEnd}`;
  }

  if (body.minNumberSeats !== undefined) {
    matchingOffers += ` AND "numberSeats" >= ${body.minNumberSeats}`;
  }

  if (body.minPrice !== undefined) {
    matchingOffers += ` AND "price" >= ${body.minPrice}`;
  }

  if (body.maxPrice !== undefined) {
    matchingOffers += ` AND "price" <= ${body.maxPrice}`;
  }

  if (body.carType !== undefined) {
    matchingOffers += ` AND "carType" = '${body.carType}'`;
  }

  if (body.onlyVollkasko !== undefined) {
    matchingOffers += ` AND "hasVollkasko" = ${body.onlyVollkasko}`;
  }

  if (body.minFreeKilometer !== undefined) {
    matchingOffers += ` AND "freeKilometers" >= ${body.minFreeKilometer}`;
  }

  // Add ordering, pagination, and final parts of the query
  if (body.sortOrder) {
    // make the string price-ask to price ASC, ask DESC
    const sortOrder = body.sortOrder.replace("-", " ");

    matchingOffers += ` ORDER BY ${sortOrder}`;
  }

  if (body.pageSize) {
    matchingOffers += ` LIMIT ${body.pageSize}`;
  }

  const offers = await client.query(matchingOffers);

  console.log("######################");
  console.log(offers.rows);

  return {
    offers: offers,
    priceRanges: [],
    carTypeCounts: {},
    seatsCount: [],
  };
}
