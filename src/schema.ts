const { Elysia, t } = require('elysia');


export const requestGetOffers = t.Object({
    regionID: t.Integer(), // Region ID for which offers are returned. Replace with actual value.
    timeRangeStart: t.Integer(), // Timestamp (ms since UNIX epoch) from when offers are considered (inclusive). Replace with actual value.
    timeRangeEnd: t.Integer(), // Timestamp (ms since UNIX epoch) until when offers are considered (inclusive). Replace with actual value.
    numberDays: t.Integer(), // Number of full days (24h) the car is available within the time range. Replace with actual value.
    sortOrder: t.String(), // 'price-asc' or 'price-desc'. Replace with actual value.
    page: t.Integer(), // Page number for pagination. Replace with actual value.
    pageSize: t.Integer(), // Number of offers per page. Replace with actual value.
    priceRangeWidth: t.Integer(), // Width of the price range blocks in cents. Replace with actual value.
    minFreeKilometerWidth: t.Integer(), // Width of the min free kilometer in km. Replace with actual value.
    minNumberSeats: t.Optional(t.Integer()), // Optional: Minimum number of seats. Replace with actual value or leave undefined.
    minPrice: t.Optional(t.Integer()), // Optional: Minimum price in cents. Replace with actual value or leave undefined.
    maxPrice: t.Optional(t.Integer()), // Optional: Maximum price in cents. Replace with actual value or leave undefined.
    carType: t.Optional(t.String()), // Optional: Car type ('small', 'sports', 'luxury', 'family'). Replace with actual value or leave undefined.
    onlyVollkasko: t.Optional(t.Boolean()), // Optional: Whether only offers with vollkasko are returned. Replace with actual value or leave undefined.
    minFreeKilometer: t.Optional(t.Integer()) // Optional: Minimum number of kilometers that the offer includes for free. Replace with actual value or leave undefined.
  });

export const responseGetOffers = t.Object({
    offers: t.Array(t.Object({
      ID: t.String(), // The unique identifier of the offer
      data: t.String() // Additional data of the offer, base64 encoded 256 Byte array
    })),
    priceRanges: t.Array(t.Object({
      start: t.Integer(), // The start of the price range in cent
      end: t.Integer(), // The end of the price range in cent
      count: t.Integer() // The number of offers in this price range
    })),
    carTypeCounts: t.Object({
      small: t.Integer(), // The number of offers with the car type small
      sports: t.Integer(), // The number of offers with the car type sports
      luxury: t.Integer(), // The number of offers with the car type luxury
      family: t.Integer() // The number of offers with the car type family
    }),
    seatsCount: t.Array(t.Object({
      numberSeats: t.Integer(), // The number of seats the cars have
      count: t.Integer() // The number of offers with the given number of seats
    })),
    freeKilometerRange: t.Array(t.Object({
      start: t.Integer(), // The start of the free kilometer range
      end: t.Integer(), // The end of the free kilometer range
      count: t.Integer() // The number of offers in this free kilometer range
    })),
    vollkaskoCount: t.Object({
      trueCount: t.Integer(), // The number of offers with vollkasko
      falseCount: t.Integer() // The number of offers without vollkasko
    })
  });

 export const requestPostOffers = t.Object({
    offers: t.Array(t.Object({
      ID: t.String(), // The unique identifier of the offer
      data: t.String(), // Additional data for the offer, base64 encoded 256 Byte array
      mostSpecificRegionID: t.Integer(), // The ID of the most specific region the offer belongs to
      startDate: t.Integer(), // The start date of the offer in ms since UNIX epoch
      endDate: t.Integer(), // The end date of the offer in ms since UNIX epoch
      numberSeats: t.Integer(), // The number of seats the car has
      price: t.Integer(), // The price in cents
      carType: t.String(), // The car type the offer belongs to
      hasVollkasko: t.Boolean(), // Whether the offer has Vollkasko
      freeKilometers: t.Integer() // The number of kilometers included for free
    }))
  });