//import { RentalOffer } from "./models/RentalOffers";
import { requestGetOffers } from "../schema";

export function getOffers(body : typeof requestGetOffers) {
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

export function postOffer(body : any) {
  return {
    status: 200,
    message: 'Offer posted successfully'
  };
}

export function cleanUp() {
  return [];
}

