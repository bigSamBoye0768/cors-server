import mongoose from "mongoose";

export interface Session extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    sessionToken: string; // Unique token for the session
    userAgent: string | null; // User agent string for the session
    ipAddress: string | null; // IP address of the user
    lastActivity?: Date; // Optional field to track last activity time
    isActive: boolean; // Indicates if the session is active
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
}

export const SessionSchema = new mongoose.Schema<Session>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
        sessionToken: { type: String, required: true, unique: true },
        userAgent: { type: String, default: null },
        ipAddress: { type: String, default: null },
        lastActivity: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
    },
    {
        timestamps: true,
    }
);

const SessionModel = mongoose.model<Session>("Session", SessionSchema);
export default SessionModel;

// // DB record
// {
//   sessionId: "0f5b1c2a...",
//   userId: 42,
//   sessionTokenHash: "hash('secret-random-string')",
//   createdAt: "...",
//   expiresAt: "..."
// }

// {
//   _id: ObjectId,
//   userId: ObjectId("user123"),
//   userAgent: "Mozilla/5.0 ...",
//   ipAddress: "105.112.44.22",
//   createdAt: new Date(),
//   expiresAt: new Date(Date.now() + 7*24*60*60*1000) // 7 days
// }

// {
//   "sessionId": "abc123",
//   "userId": "64a3c...mongoId",
//   "ipAddress": "192.168.1.5",
//   "userAgent": "Chrome 138",
//   "createdAt": "2025-08-08T12:00:00Z",
//   "expiresAt": "2025-08-15T12:00:00Z",
//   "lastActivity": "2025-08-08T12:35:00Z"
// }
