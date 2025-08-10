import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";

export const hashValue = (value: string, saltRounds: number = 10): Promise<string> => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(value, saltRounds, (err, hash) => {
            if (err) {
                return reject(err);
            }
            resolve(hash);
        });
    });
};

export const compareHash = (value: string, hash: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(value, hash, (err, isMatch) => {
            if (err) {
                return reject(err);
            }
            resolve(isMatch);
        });
    });
};

export const generateSessionToken = (): string => {
    return crypto.randomBytes(32).toString("hex");
};

export const generateEmailVerificationToken = (): string => {
    return crypto.randomBytes(16).toString("hex");
};

export const generatePasswordResetToken = (): string => {
    return crypto.randomBytes(32).toString("hex");
};

export const generateRandomString = (length: number = 16): string => {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
};

export const isValidObjectId = (id: string): boolean => {
    return mongoose.Types.ObjectId.isValid(id);
};
