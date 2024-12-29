import { Request, Router } from "express";
import { DefaultResponse } from "../types/responseTypes.js";

/**
 * Maps an app status checking endpoint
 */
const statusRouter = Router();

statusRouter.head("/", (request: Request, response: DefaultResponse) => {
    response.send();
});

export default statusRouter;
