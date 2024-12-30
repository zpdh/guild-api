import { Request, Router } from "express";
import validateJwtToken from "../middleware/jwtTokenValidator.middleware.js";
import UserModel, { IUser } from "../models/userModel.js";
import { DefaultResponse } from "../types/responseTypes.js";

/**Maps all endpoints related to user information. */
const userInfoRouter = Router();
userInfoRouter.use(validateJwtToken);

// TODO: validate token for uuid being updated
userInfoRouter.get(
    "/blocked/:uuid",
    async (request: Request<{ uuid: string }, {}, {}>, response: DefaultResponse<string[]>) => {
        try {
            const uuid = request.params.uuid.replaceAll("-", "");
            const user = await UserModel.findOneAndUpdate(
                { uuid: uuid },
                {},
                { upsert: true, new: true, collation: { locale: "en", strength: 2 } }
            );
            response.send(user.blocked);
        } catch (error) {
            console.error("get blocked error:", error);
            response.status(500).send({ error: "something went wrong" });
        }
    }
);

userInfoRouter.post(
    "/blocked/:uuid",
    async (request: Request<{ uuid: string }, {}, { toBlock: string }>, response: DefaultResponse<IUser>) => {
        try {
            const toBlock = request.body.toBlock;
            const uuid = request.params.uuid.replaceAll("-", "");
            const user = await UserModel.findOneAndUpdate(
                {
                    uuid: uuid,
                },
                {},
                { upsert: true, new: true, collation: { locale: "en", strength: 2 } }
            );
            if (user) {
                if (user.blocked.length >= 60) {
                    response.status(400).send({ error: "Blocked list full." });
                    return;
                }
                if (user.blocked.find((blocked) => blocked === toBlock)) {
                    response.status(400).send({ error: "User already in block list." });
                    return;
                }
            }
            await user.updateOne({ $addToSet: { blocked: toBlock } });
            response.send(user);
        } catch (error) {
            console.error("update blocked error:", error);
            response.status(500).send({ error: "something went wrong" });
        }
    }
);

userInfoRouter.delete(
    "/blocked/:uuid/:toRemove",
    async (request: Request<{ uuid: string; toRemove: string }>, response: DefaultResponse) => {
        try {
            const uuid = request.params.uuid.replaceAll("-", "");
            const toRemove = request.params.toRemove;
            const user = await UserModel.findOne({
                uuid: uuid,
            });
            if (!user) {
                response.status(404).send({ error: "user not found" });
                return;
            }
            if (user.blocked.find((blocked) => blocked === toRemove)) {
                await user.updateOne({ $pull: { blocked: toRemove } });
                response.send();
            } else {
                response.status(404).send({ error: "Blocked user not found." });
            }
        } catch (error) {
            console.error("update blocked error:", error);
            response.status(500).send({ error: "something went wrong" });
        }
    }
);

export default userInfoRouter;
