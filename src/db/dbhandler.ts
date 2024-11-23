import { RentalOffer } from "./models/RentalOffers";
import { requestGetOffers, requestPostOffers } from "../schema";

export function getOffers(body: typeof requestGetOffers) {
  /*try {
    const offers = await RentalOffer.findAll();
    return offers.map(offer => offer.toJSON());
  } catch (error) {
    console.error('Error getting offers:', error);
    return [];
  }
    */
  return {
    offers: [],
    priceRanges: [],
    carTypeCounts: {
      small: 0,
      sports: 0,
      luxury: 0,
      family: 0
    },
    seatsCount: [],
    freeKilometerRange: [],
    vollkaskoCount: {
      trueCount: 0,
      falseCount: 0
    }
  }
}

export async function postOffer(body: requestPostOffers) {
  console.log("POST offer")
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
      freeKilometers: offerData.freeKilometers
    });

    console.log('Created offer:', offer.id);
    return offer;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error; // Re-throw the error to be handled by the route handler
  }
}

export async function cleanUp() {
  console.log("Cleaning up offers");
  try {
    await RentalOffer.destroy({
      where: {},  // empty where clause means delete all
      truncate: true  // this resets the auto-incrementing primary key
    });
    console.log("Successfully cleaned up all offers");
    return { success: true, message: "All offers have been cleaned up" };
  } catch (error) {
    console.error('Error cleaning up offers:', error);
    throw error;
  }
}
