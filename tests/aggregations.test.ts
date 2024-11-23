import { describe, expect, test, beforeAll } from "bun:test";
import request from "supertest";

import { API_URL } from "./constants";

// Extended test data helpers
const generateTestOffers = () => [
	{
		ID: "550e8400-e29b-41d4-a716-446655440001",
		data: Buffer.from("test data 1").toString('base64'),
		mostSpecificRegionID: 1234,
		startDate: Date.now(),
		endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
		numberSeats: 5,
		price: 5000,
		carType: "family",
		hasVollkasko: true,
		freeKilometers: 1000
	},
	{
		ID: "550e8400-e29b-41d4-a716-446655440002",
		data: Buffer.from("test data 2").toString('base64'),
		mostSpecificRegionID: 1234,
		startDate: Date.now(),
		endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
		numberSeats: 2,
		price: 8000,
		carType: "sports",
		hasVollkasko: false,
		freeKilometers: 500
	},
	{
		ID: "550e8400-e29b-41d4-a716-446655440003",
		data: Buffer.from("test data 3").toString('base64'),
		mostSpecificRegionID: 1234,
		startDate: Date.now(),
		endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
		numberSeats: 4,
		price: 12000,
		carType: "luxury",
		hasVollkasko: true,
		freeKilometers: 2000
	},
	{
		ID: "550e8400-e29b-41d4-a716-446655440004",
		data: Buffer.from("test data 4").toString('base64'),
		mostSpecificRegionID: 1234,
		startDate: Date.now(),
		endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
		numberSeats: 4,
		price: 3000,
		carType: "small",
		hasVollkasko: false,
		freeKilometers: 750
	}
];

// Helper function to create mandatory filter query
const createMandatoryFilters = () => ({
	regionID: 1234,
	timeRangeStart: Date.now(),
	timeRangeEnd: Date.now() + 14 * 24 * 60 * 60 * 1000,
	numberDays: 7,
	sortOrder: "price_asc",
	page: 1,
	pageSize: 10
});

describe("Rental Offers API Aggregation Tests", () => {
	// Setup test data before running tests
	beforeAll(async () => {
		// Clear existing data and insert test offers
		const testOffers = generateTestOffers();
		await request(API_URL)
			.post("/api/offers")
			.send({ offers: testOffers });
	});

	describe("Aggregation Results with Mandatory Filters Only", () => {
		test("should return correct aggregations when only mandatory filters are applied", async () => {
			const mandatoryFilters = createMandatoryFilters();
			const queryString = new URLSearchParams(mandatoryFilters).toString();

			const response = await request(API_URL)
				.get(`/api/offers?${queryString}`)
				.expect(200);

			// Verify price range aggregations
			expect(response.body.priceRanges).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						start: 3000,
						end: 6000,
						count: 1
					}),
					expect.objectContaining({
						start: 6000,
						end: 9000,
						count: 1
					}),
					expect.objectContaining({
						start: 9000,
						end: 12000,
						count: 1
					})
				])
			);

			// Verify car type counts
			expect(response.body.carTypeCounts).toEqual({
				small: 1,
				sports: 1,
				luxury: 1,
				family: 1
			});

			// Verify seats count aggregations
			expect(response.body.seatsCount).toEqual(
				expect.arrayContaining([
					{ numberSeats: 2, count: 1 },
					{ numberSeats: 4, count: 2 },
					{ numberSeats: 5, count: 1 }
				])
			);

			// Verify free kilometer range aggregations
			expect(response.body.freeKilometerRange).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						start: 500,
						end: 1000,
						count: 2
					}),
					expect.objectContaining({
						start: 1000,
						end: 1500,
						count: 1
					}),
					expect.objectContaining({
						start: 1500,
						end: 2000,
						count: 1
					})
				])
			);

			// Verify vollkasko counts
			expect(response.body.vollkaskoCount).toEqual({
				trueCount: 2,
				falseCount: 2
			});
		});
	});

	describe("Aggregation Results with Optional Filters", () => {
		test("should return correct aggregations when car type filter is applied", async () => {
			const filters = {
				...createMandatoryFilters(),
				carType: "family"
			};
			const queryString = new URLSearchParams(filters).toString();

			const response = await request(API_URL)
				.get(`/api/offers?${queryString}`)
				.expect(200);

			// Verify car type counts remain unchanged
			expect(response.body.carTypeCounts).toEqual({
				small: 1,
				sports: 1,
				luxury: 1,
				family: 1
			});

			// Other aggregations should reflect the family car type filter
			expect(response.body.vollkaskoCount).toEqual({
				trueCount: 1,
				falseCount: 0
			});
		});

		test("should return correct aggregations when price range filter is applied", async () => {
			const filters = {
				...createMandatoryFilters(),
				minPrice: 5000,
				maxPrice: 10000,
				priceRangeWidth: 1000
			};
			const queryString = new URLSearchParams(filters).toString();

			const response = await request(API_URL)
				.get(`/api/offers?${queryString}`)
				.expect(200);

			// Verify price ranges remain complete
			expect(response.body.priceRanges).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						start: 3000,
						end: 6000,
						count: 1
					}),
					expect.objectContaining({
						start: 6000,
						end: 9000,
						count: 1
					}),
					expect.objectContaining({
						start: 9000,
						end: 12000,
						count: 1
					})
				])
			);

			// Other aggregations should reflect the price filter
			expect(response.body.carTypeCounts).toEqual({
				small: 0,
				sports: 1,
				luxury: 0,
				family: 1
			});
		});

		test("should return correct aggregations when multiple optional filters are applied", async () => {
			const filters = {
				...createMandatoryFilters(),
				minPrice: 5000,
				maxPrice: 10000,
				carType: "family",
				onlyVollkasko: "true",
				minFreeKilometer: 1000
			};
			const queryString = new URLSearchParams(filters).toString();

			const response = await request(API_URL)
				.get(`/api/offers?${queryString}`)
				.expect(200);

			// Verify all aggregations maintain their structure
			expect(response.body.carTypeCounts).toEqual({
				small: 1,
				sports: 1,
				luxury: 1,
				family: 1
			});

			expect(response.body.vollkaskoCount).toEqual({
				trueCount: 2,
				falseCount: 2
			});

			// Verify filtered results
			expect(response.body.offers).toHaveLength(1);
			expect(response.body.offers[0].carType).toBe("family");
			expect(response.body.offers[0].hasVollkasko).toBe(true);
			expect(response.body.offers[0].freeKilometers).toBeGreaterThanOrEqual(1000);
		});
	});

	describe("Edge Cases and Special Scenarios", () => {
		test("should handle empty result sets correctly", async () => {
			const filters = {
				...createMandatoryFilters(),
				minPrice: 50000 // Price that no offer matches
			};
			const queryString = new URLSearchParams(filters).toString();

			const response = await request(API_URL)
				.get(`/api/offers?${queryString}`)
				.expect(200);

			// Verify empty results but complete aggregation structure
			expect(response.body.offers).toHaveLength(0);
			expect(response.body.priceRanges).toBeDefined();
			expect(response.body.carTypeCounts).toBeDefined();
			expect(response.body.seatsCount).toBeDefined();
			expect(response.body.freeKilometerRange).toBeDefined();
			expect(response.body.vollkaskoCount).toBeDefined();
		});
	});
});
