import jwt, { Secret, SignOptions } from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { JWTPayload } from "../types/models";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "your-access-secret-key";
const JWT_REFRESH_SECRET: Secret =
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(password, salt);
};

export const comparePassword = async (
    password: string,
    hash: string,
): Promise<boolean> => {
    return bcryptjs.compare(password, hash);
};

export const generateToken = (
    payload: JWTPayload,
    expiresIn: SignOptions["expiresIn"] = "15m",
): string => {
    const cleanPayload = {
        userId: payload.userId,
        trainingCenterId: payload.trainingCenterId,
        email: payload.email,
        role: payload.role,
    };
    return jwt.sign(cleanPayload, JWT_SECRET, { expiresIn });
};

export const generateRefreshToken = (
    payload: JWTPayload,
    expiresIn: SignOptions["expiresIn"] = "7d",
): string => {
    const cleanPayload = {
        userId: payload.userId,
        trainingCenterId: payload.trainingCenterId,
        email: payload.email,
        role: payload.role,
    };
    return jwt.sign(cleanPayload, JWT_REFRESH_SECRET, { expiresIn });
};

export const verifyToken = (token: string): JWTPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        throw new Error("Invalid or expired access token");
    }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
};
