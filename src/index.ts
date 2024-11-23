import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { getOffers, postOffer, cleanUp } from "./db/dbhandler";
import { logger } from "./utils/logger";
import { requestGetOffers, responseGetOffers, requestPostOffers } from "./schema";
const app = new Elysia({
  serve: {
    port: 80,
  },
})
  .use(swagger())
  .onError((ctx) => {
    logger.error(ctx, ctx.error.stack);
    if (ctx.code === 'NOT_FOUND') return 'Route not found';
  })

  .get("/", async () => {
    return { message: "Welcome to the Car Rental API" };
  })
  .get('/api/offers', ({ body}) => {
    // Logic to retrieve and return the offers based on requestBodySchema can go here
    return getOffers(body);
  }, {
    body: requestGetOffers,
    response: responseGetOffers
  })
  .post("/api/offers", ({body}) => {
    return postOffer(body);
  })
  .delete('/api/offers', () => {
    // Logic to delete all offers can go here
    return { status: 200, message: 'All offers deleted successfully' };
  })

  // @ts-ignore
  .onError(({ code, error, set }) => {
    console.error(`Error: ${code}`, error);
    set.status = 500;
    return { error: "Internal Server Error" };
  })
  // .listen(80, () => {
  //   console.log("Server is running on port 80");
  // });

export default app;