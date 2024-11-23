import { RentalOffer } from "./models/RentalOffers";
import { requestGetOffers } from "../schema";

export function getOffers(body : typeof requestGetOffers) {
  try {
    const offers = await RentalOffer.findAll();
    return offers.map(offer => offer.toJSON());
  } catch (error) {
    console.error('Error getting offers:', error);
    return [];
  }
}

export function postOffer(body : any) {
  return [];
}

export function cleanUp() {
  return [];
}