import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { getOffers, postOffer, cleanUp } from "./db/dbhandler";
import { logger } from "./utils/logger";

import { RegionService } from "./utils/regions/region";

// Load regions from file
export const regionService = new RegionService();
const jsonData = await Bun.file("src/utils/regions/regions.json").text();
regionService.loadRegions(jsonData);

import {
  requestGetOffers,
  responseGetOffers,
  requestPostOffers,
  parseQueryParams,
} from "./schema";
const app = new Elysia({
  serve: {
    port: 80,
  },
})
  .use(swagger())
  .onError((ctx) => {
    logger.error(ctx, ctx.error.stack);
    if (ctx.code === "NOT_FOUND") return "Route not found";
  })

  .get("/", async () => {
    return { message: "Welcome to the Car Rental API" };
  })
  .get(
    "/api/offers",
    ({ query }) => {
      const validatedParams = parseQueryParams(query);

      return getOffers(validatedParams);
    },
    {
      validatedParams: requestGetOffers,
      response: responseGetOffers,
    },
  )
  .post(
    "/api/offers",
    ({ body, set }) => {
      set.status = 200;
      return postOffer(body);
    },
    { body: requestPostOffers },
  )
  .delete("/api/offers", ({ body, set }) => {
    set.status = 200;
    return cleanUp();
  })

  // @ts-ignore
  .onError(({ code, error, set }) => {
    console.error(`Error: ${code}`, error);
    set.status = 500;
    return { error: "Internal Server Error" };
  });
// .listen(80, () => {
//   console.log("Server is running on port 80");
// });

export default app;
