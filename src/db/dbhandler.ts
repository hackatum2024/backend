import { RentalOffer } from "./models/RentalOffers";
import { requestGetOffers } from "../schema";

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

export async function postOffer(body) {
  console.log("POST offer")
  try {
    const offer = await RentalOffer.create({
      data: "Example car details",
      mostSpecificRegionID: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      numberSeats: 5,
      price: 10000, // in cents
      carType: "SUV",
      hasVollkasko: true,
      freeKilometers: 1000
    });
    console.log('Created offer:', offer.id);
  } catch (error) {
    console.error('Error creating offer:', error);
  }
}


export function cleanUp() {
  return [];
}

