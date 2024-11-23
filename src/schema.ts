const { Elysia, t} = require('elysia');

export const requestGetOffers = t.Object({
  regionID: t.Integer(),
  timeRangeStart: t.Integer(),
  timeRangeEnd: t.Integer(),
  numberDays: t.Integer(),
  sortOrder: t.String(),
  page: t.Integer(),
  pageSize: t.Integer(),
  priceRangeWidth: t.Integer(),
  minFreeKilometerWidth: t.Integer(),
  minNumberSeats: t.Optional(t.Integer()),
  minPrice: t.Optional(t.Integer()),
  maxPrice: t.Optional(t.Integer()),
  carType: t.Optional(t.String()),
  onlyVollkasko: t.Optional(t.Boolean()),
  minFreeKilometer: t.Optional(t.Integer())
});

export const parseQueryParams = (query : any) => {
return {
  regionID: parseInt(query.regionID, 10),
  timeRangeStart: parseInt(query.timeRangeStart, 10),
  timeRangeEnd: parseInt(query.timeRangeEnd, 10),
  numberDays: parseInt(query.numberDays, 10),
  sortOrder: query.sortOrder,
  page: parseInt(query.page, 10),
  pageSize: parseInt(query.pageSize, 10),
  priceRangeWidth: parseInt(query.priceRangeWidth, 10),
  minFreeKilometerWidth: parseInt(query.minFreeKilometerWidth, 10),
  minNumberSeats: query.minNumberSeats ? parseInt(query.minNumberSeats, 10) : undefined,
  minPrice: query.minPrice ? parseInt(query.minPrice, 10) : undefined,
  maxPrice: query.maxPrice ? parseInt(query.maxPrice, 10) : undefined,
  carType: query.carType,
  onlyVollkasko: query.onlyVollkasko === 'true',
  minFreeKilometer: query.minFreeKilometer ? parseInt(query.minFreeKilometer, 10) : undefined
};
};

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