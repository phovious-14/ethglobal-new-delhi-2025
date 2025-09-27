import axios from "axios";
import { env } from "@/src/env.mjs";

const baseUrl = env.NEXT_PUBLIC_DRIPPAY_BACKEND_BASE_URL;

export const getUserById = async (userId: string, accessToken: string) => {
  try {
    const response = await axios.get(
      `${baseUrl}/api/users/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to fetch user by id");
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const createUser = async (user: {
  username: string;
  email: string;
  walletAddress: string;
  privyId: string;
}) => {
  try {
    const response = await axios.post(
      `${baseUrl}/api/users/create`,
      user,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUserByPrivyId = async (privyId: string, accessToken: string) => {
  try {
    const response = await axios.get(
      `${baseUrl}/api/users/privy/${privyId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to fetch user by privyId");
    }
  } catch (error) {
    // Don't log every error to reduce console spam
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // User not found, return null instead of throwing
      return null;
    }
    console.error("Error fetching user by privyId:", error);
    throw error;
  }
};

export const addRecipient = async (recipient: {
  privyId: string;
  recipientAddress: string;
  recipientName: string;
  accessToken: string;
}) => {
  try {
    const response = await axios.post(`${baseUrl}/api/users/save-recepient/${recipient.privyId}`, recipient, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${recipient.accessToken}`,
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error adding recipient:", error);
    throw error;
  }
};

export const getRecipients = async (privyId: string, accessToken: string) => {
  try {
    const response = await axios.get(`${baseUrl}/api/users/get-recepients/${privyId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error getting recipients:", error);
    throw error;
  }
}