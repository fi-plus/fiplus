import { apiRequest } from "@/lib/queryClient";

export const api = {
  auth: {
    login: (data: any) => apiRequest("POST", "/api/auth/login", data),
    register: (data: any) => apiRequest("POST", "/api/auth/register", data),
    me: () => apiRequest("GET", "/api/auth/me"),
  },
  wallets: {
    get: () => apiRequest("GET", "/api/wallets"),
  },
  transactions: {
    send: (data: any) => apiRequest("POST", "/api/transactions/send", data),
    get: () => apiRequest("GET", "/api/transactions"),
  },
  exchangeRates: {
    get: () => apiRequest("GET", "/api/exchange-rates"),
  },
};
