import { RentalOffer } from "./models/RentalOffers";
import { requestGetOffers, requestPostOffers } from "../schema";
import { sequelize } from "./dbconnect";
import { regionService } from "..";
import { logger } from "../utils/logger";
import { QueryTypes } from "sequelize";

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


    console.log('Created offer:', offer.id);
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
