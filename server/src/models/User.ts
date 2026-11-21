import { getDB } from "../config/db.js";

export type UserRole = "admin" | "user";

export interface UserDocument {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}

export function getUserCollection() {
  return getDB().collection<UserDocument>("users");
}
