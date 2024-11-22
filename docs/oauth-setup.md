# Setting Up OAuth Providers for InstantMock

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: `InstantMock Local`
   - Homepage URL: `http://localhost:3033`
   - Authorization callback URL: `http://localhost:3033/auth/callback/github`
4. Click "Register application"
5. Copy the generated Client ID
6. Generate a Client Secret and copy it
7. Add to your `.env` file:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

## Microsoft Azure OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Click "New registration"
3. Fill in the application details:
   - Name: `InstantMock Local`
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: `http://localhost:3033/auth/callback/azure`
4. Click "Register"
5. Copy the Application (client) ID
6. Under "Certificates & secrets", create a new client secret
7. Add to your `.env` file:
   ```
   AZURE_CLIENT_ID=your_client_id
   AZURE_CLIENT_SECRET=your_client_secret
   ```

## Restart Required

After adding the credentials to your `.env` file, restart the InstantMock server for the changes to take effect.