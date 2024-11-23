import { RentalOffer } from "./models/RentalOffers";
import { requestGetOffers, requestPostOffers } from "../schema";
import { sequelize } from "./dbconnect";
import { regionService } from "..";
import { logger } from "../utils/logger";
import { Op, fn, col, literal, QueryTypes } from "sequelize";

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

export async function testGet(body: typeof requestGetOffers) {
  const regionIds = regionService.getSubregionIds(body.regionID);
  const matchingOffers = `SELECT * FROM rental_offers 
  WHERE most_specific_region_id = ANY(ARRAY[${regionIds}])  
  AND start_date >= ${body.timeRangeStart}
  AND end_date <= ${body.timeRangeEnd}
  AND number_seats >= ${body.minNumberSeats}
  AND price >= ${body.minPrice}
  AND price <= ${body.maxPrice}
  AND car_type = ${body.carType}
  AND has_vollkasko = ${body.onlyVollkasko}
  AND free_kilometers >= ${body.minFreeKilometer}
  ORDER BY ${body.sortOrder}
  LIMIT ${body.pageSize} 
  `;

  if (body.minNumberSeats === undefined) {
    matchingOffers.replace("AND number_seats >= ${body.minNumberSeats}", "");
  }
  if (body.minPrice === undefined) {
    matchingOffers.replace("AND price >= ${body.minPrice}", "");
  }
  if (body.maxPrice === undefined) {
    matchingOffers.replace("AND price <= ${body.maxPrice}", "");
  }
  if (body.carType === undefined) {
    matchingOffers.replace("AND car_type = ${body.carType}", "");
  }
  if (body.onlyVollkasko === undefined) {
    matchingOffers.replace("AND has_vollkasko = ${body.onlyVollkasko}", "");
  }
  if (body.minFreeKilometer === undefined) {
    matchingOffers.replace(
      "AND free_kilometers >= ${body.minFreeKilometer}",
      ""
    );
  }

  const priceRanges = `SELECT max(price), min(price), Count(*) FROM offers GROUP BY price`;

  const carTypeCounts = `SELECT car_type, Count(*) FROM offers GROUP BY car_type`;

  const seatsCount = `SELECT number_seats, Count(*) FROM offers GROUP BY number_seats`;

  const freeKilometerRange = `SELECT max(free_kilometers), min(free_kilometers), Count(*) FROM offers GROUP BY free_kilometers`;

  const vollkaskoCount = `SELECT has_vollkasko, Count(*) FROM offers GROUP BY has_vollkasko`;

  const onlyGetIDandData = `SELECT ID, data FROM offers`;

  const [offers] = await sequelize.query(matchingOffers, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  const [priceRanges2] = await sequelize.query(priceRanges, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  const [carTypeCounts2] = await sequelize.query(carTypeCounts, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  const [seatsCount2] = await sequelize.query(seatsCount, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  const [freeKilometerRange2] = await sequelize.query(freeKilometerRange, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  const [vollkaskoCount2] = await sequelize.query(vollkaskoCount, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  const [onlyGetIDandData2] = await sequelize.query(onlyGetIDandData, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  return {
    onlyGetIDandData2,
    priceRanges2,
    carTypeCounts2,
    seatsCount2,
    freeKilometerRange2,
    vollkaskoCount2,
  };
}
