import { Request, Router } from "express";
import { DefaultResponse } from "../communication/responses/defaultResponse.js";

/**
 * Maps a health check endpoint
 */
const healthRouter = Router();

healthRouter.get("/", (request: Request, response: DefaultResponse) => {
    response.send();
});

export default healthRouter;
