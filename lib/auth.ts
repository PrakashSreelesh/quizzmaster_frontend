import api from "./api";
import { User } from "./types";

export const getMe = async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data;
};

export const logout = () => {
    localStorage.removeItem("access_token");
};
