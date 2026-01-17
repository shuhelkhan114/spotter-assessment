import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const AMADEUS_API_URL = "https://test.api.amadeus.com";

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await axios.post(
    `${AMADEUS_API_URL}/v1/security/oauth2/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID || "",
      client_secret: process.env.AMADEUS_CLIENT_SECRET || "",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;

  return accessToken as string;
}

function createAmadeusClient(): AxiosInstance {
  const client = axios.create({
    baseURL: AMADEUS_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const errorMessage =
          error.response.data?.errors?.[0]?.detail ||
          error.response.data?.error_description ||
          "An error occurred with the Amadeus API";
        return Promise.reject(new Error(errorMessage));
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const amadeusClient = createAmadeusClient();
