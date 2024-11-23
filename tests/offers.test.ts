import { describe, expect, test, beforeAll } from "bun:test";
import request from "supertest";
import { API_URL } from "./constants";

// Test data helpers
const generateTestOffer = () => ({
	ID: "550e8400-e29b-41d4-a716-446655440000", // Example UUID
	data: Buffer.from("test data").toString('base64'),
	mostSpecificRegionID: 1234,
	startDate: Date.now(),
	endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
	numberSeats: 5,
	price: 5000, // 50 EUR in cents
	carType: "family",
	hasVollkasko: true,
	freeKilometers: 1000
});

const generateGetOffersQuery = () => ({
	regionID: 1234,
	timeRangeStart: Date.now(),
	timeRangeEnd: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days from now
	numberDays: 7,
	sortOrder: "price_asc",
	page: 1,
	pageSize: 10,
	priceRangeWidth: 1000, // 10 EUR in cents
	minFreeKilometerWidth: 100,
	minNumberSeats: 4,
	minPrice: 2000, // 20 EUR in cents
	maxPrice: 10000, // 100 EUR in cents
	carType: "family",
	onlyVollkasko: true,
	minFreeKilometer: 500
});

describe("Rental Offers API", () => {
	// Wait for API to be ready
	beforeAll(async () => {
		let retries = 5;
		while (retries > 0) {
			try {
				await fetch(`${API_URL}/api/offers`);
				break;
			} catch (error) {
				retries--;
				if (retries === 0) throw new Error("API failed to become available");
				await new Promise(resolve => setTimeout(resolve, 2000));
			}
		}
	});

	describe("GET /api/offers", () => {
		test("should return offers and aggregated data", async () => {
			// First create some test data
			const testOffer = generateTestOffer();
			await request(API_URL)
				.post("/api/offers")
				.send({ offers: [testOffer] })
				.expect(201);

			// Then query the offers
			const query = generateGetOffersQuery();
			const queryString = new URLSearchParams({
				...query,
				onlyVollkasko: query.onlyVollkasko.toString()
			}).toString();

			const response = await request(API_URL)
				.get(`/api/offers?${queryString}`)
				.expect("Content-Type", /json/)
				.expect(200);

			// Verify response structure
			expect(response.body).toHaveProperty('offers');
			expect(response.body).toHaveProperty('priceRanges');
			expect(response.body).toHaveProperty('carTypeCounts');
			expect(response.body).toHaveProperty('seatsCount');
			expect(response.body).toHaveProperty('freeKilometerRange');
			expect(response.body).toHaveProperty('vollkaskoCount');

			// Verify offers array structure
			expect(Array.isArray(response.body.offers)).toBe(true);
			if (response.body.offers.length > 0) {
				expect(response.body.offers[0]).toHaveProperty('ID');
				expect(response.body.offers[0]).toHaveProperty('data');
			}

			// Verify carTypeCounts structure
			expect(response.body.carTypeCounts).toHaveProperty('small');
			expect(response.body.carTypeCounts).toHaveProperty('sports');
			expect(response.body.carTypeCounts).toHaveProperty('luxury');
			expect(response.body.carTypeCounts).toHaveProperty('family');

			// Verify vollkaskoCount structure
			expect(response.body.vollkaskoCount).toHaveProperty('trueCount');
			expect(response.body.vollkaskoCount).toHaveProperty('falseCount');
		});
	});

	describe("POST /api/offers", () => {
		test("should create new offers", async () => {
			const testOffer = generateTestOffer();

			const response = await request(API_URL)
				.post("/api/offers")
				.send({ offers: [testOffer] })
				.expect("Content-Type", /json/)
				.expect(201);

		});
	});

	describe("DELETE /api/offers", () => {
		test("should delete specified offers", async () => {
			// First create an offer
			const testOffer = generateTestOffer();
			await request(API_URL)
				.post("/api/offers")
				.send({ offers: [testOffer] });

			// Then delete it
			const response = await request(API_URL)
				.delete(`/api/offers/${testOffer.ID}`)
				.expect(404);

			// Verify it's deleted by trying to fetch it
			const query = generateGetOffersQuery();
			const queryString = new URLSearchParams({
				...query,
				onlyVollkasko: query.onlyVollkasko.toString()
			}).toString();

			const getResponse = await request(API_URL)
				.get(`/api/offers?${queryString}`);

			const deletedOffer = getResponse.body.offers.find(
				(offer: { ID: string }) => offer.ID === testOffer.ID
			);
			expect(deletedOffer).toBeUndefined();
		});
	});
});
