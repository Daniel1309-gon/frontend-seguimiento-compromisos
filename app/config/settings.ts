export const settings = {
  azure: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "",
    tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID || "",
    scopeName: process.env.NEXT_PUBLIC_SCOPE_NAME || "access_as_user",
    appUri: process.env.NEXT_PUBLIC_AZURE_APP_URI || "http://localhost:8000",
  },
  admin_auditor: process.env.NEXT_PUBLIC_ADMIN_USER_AUDITOR || "",
  admin_pasante: process.env.NEXT_PUBLIC_ADMIN_USER_PASANTE || "",
  redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000",
}