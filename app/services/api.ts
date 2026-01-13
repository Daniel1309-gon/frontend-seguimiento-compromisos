import axios from "axios";
import { msalInstance, loginRequest } from "../config/authConfig";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_AZURE_APP_URI || "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
  async (config) => {
    // 1. Buscamos si hay una cuenta activa
    const account = msalInstance.getAllAccounts()[0];

    if (account) {
      try {
        // 2. Intentamos obtener el token silenciosamente (sin popups)
        const response = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: account,
        });

        // 3. Si tenemos token, lo pegamos en la cabecera Authorization
        if (response.accessToken) {
            config.headers.Authorization = `Bearer ${response.accessToken}`;
        }
      } catch (error) {
        console.error("Error obteniendo token silencioso:", error);
        // Aquí podrías redirigir al login si el token expiró y no se pudo renovar
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Manejar el error 401 (no autorizado)
      console.error("No autorizado. Redirigiendo al login...");
      // Aquí podrías redirigir al usuario a la página de login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;