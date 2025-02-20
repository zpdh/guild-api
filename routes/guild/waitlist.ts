﻿import { Router } from "express";
import validateJwtToken from "../../middleware/jwtTokenValidator.middleware.js";
import { GuildRequest } from "../../communication/requests/guildRequest.js";
import { DefaultResponse } from "../../communication/responses/defaultResponse.js";
import { IWaitlist } from "../../models/schemas/waitlistSchema.js";
import { WaitlistService } from "../../services/guild/waitlistService.js";

/**
 * Maps all tome-related endpoints
 */
const waitlistRouter = Router();
const waitlistService = WaitlistService.create();

waitlistRouter.get("/:wynnGuildId", async (request: GuildRequest, response: DefaultResponse<IWaitlist[]>) => {
    response.send(await waitlistService.getWaitlist(request.params.wynnGuildId));
});

waitlistRouter.post(
    "/:wynnGuildId",
    validateJwtToken,
    async (request: GuildRequest<{}, {}, { username: string }>, response: DefaultResponse<IWaitlist>) => {
        response.send(await waitlistService.addToWaitlist(request.body.username, request.params.wynnGuildId));
    }
);

waitlistRouter.delete(
    "/:wynnGuildId/:username",
    validateJwtToken,
    async (request: GuildRequest<{ username: string }>, response: DefaultResponse) => {
        await waitlistService.removeFromWaitlist(request.params.username, request.params.wynnGuildId);
        response.send();
    }
);

export default waitlistRouter;
