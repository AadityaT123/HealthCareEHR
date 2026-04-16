import axiosClient from "../api/axiosClient";

export const login = async (credentials) => {
    const res = await axiosClient.post("/auth/login", credentials);
    return res;
};

export const register = async (data) => {
    const res = await axiosClient.post("/auth/register", data);
    return res;
};