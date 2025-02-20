import jwt, { JwtPayload } from "jsonwebtoken";
import { ExtendedError, Socket } from "socket.io";
import "../../config.js";

// Needs to match the token in the generator. Store it in a .env or .json for reusability.
const secretKey = process.env.JWT_SECRET_KEY;

/**
 * Checks if the token provided in a socket's initial connection is valid.
 * If token is invalid, return an error which will fire the "connection_error"
 * event on the socket client.
 */
function validateSocket(socket: Socket, next: (err?: ExtendedError) => void) {
    const authorizationHeader = socket.handshake.headers.authorization as string;

    if (!authorizationHeader) {
        console.log(`A websocket connection from ${socket.handshake.headers.from} was blocked`);
        return next(new Error("No token provided"));
    }

    // Get authorization headers and extract token from "Bearer <token>"
    const token = authorizationHeader.split(" ")[1];

    jwt.verify(token, secretKey, (err, payload) => {
        if (err) {
            console.log(`A websocket connection from ${socket.handshake.headers.from} was blocked ${err}`);
            return next(new Error("Invalid token provided"));
        }
        socket.data.username = socket.handshake.headers.from || "!bot";
        socket.data.modVersion = socket.handshake.headers["user-agent"];
        const p = payload! as JwtPayload;
        socket.data.wynnGuildId = p.guildId;

        // Goes to next step (function execution)
        return next();
    });
}

export default validateSocket;
