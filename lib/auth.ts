import api from "./api";
import { User } from "./types";

export const getMe = async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data;
};

export const logout = async () => {
    try {
        await api.post("/auth/logout");
    } catch (err) {
        console.error("Logout failed:", err);
    }
};
