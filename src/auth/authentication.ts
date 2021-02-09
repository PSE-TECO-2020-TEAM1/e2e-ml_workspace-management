import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config();

interface IToken {
    userId: string,
}

// export function generateAccessToken(userId: string): string {
//     const payload: IToken = {
//         userId: userId,
//     }
//     console.log(jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 60*60*24*365}));
//     return "a";
// }

function verifyAccessToken(token: string): string {
    const payload = <IToken> jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return payload.userId;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    let userId;
    try {
        const accessToken = req.headers.authorization.split(' ')[1];
        userId = verifyAccessToken(accessToken);
    } catch {
        return res.sendStatus(401);
    }

    res.locals.userId = userId;
    next();
}