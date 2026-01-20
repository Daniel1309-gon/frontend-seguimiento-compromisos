import { Configuration, PopupRequest, PublicClientApplication } from "@azure/msal-browser";
import { settings } from "./settings";

// MSAL Configuration usando settings centralizados
export const msalConfig: Configuration = {
    auth: {
        clientId: settings.azure.clientId,
        authority: `https://login.microsoftonline.com/${settings.azure.tenantId}`,
        redirectUri: settings.redirect_uri,
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};

export const loginRequest: PopupRequest = {
    scopes: [`api://${settings.azure.clientId}/${settings.azure.scopeName}`],
};

export const msalInstance = new PublicClientApplication(msalConfig);