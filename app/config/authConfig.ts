import {Configuration, PopupRequest, PublicClientApplication} from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "",
        authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID || ""}`,
        redirectUri: "http://localhost:3000",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};

export const loginRequest: PopupRequest = {
    scopes: [`api://${process.env.NEXT_PUBLIC_AZURE_CLIENT_ID}/${process.env.NEXT_PUBLIC_SCOPE_NAME}` || ""],
};

export const msalInstance = new PublicClientApplication(msalConfig);