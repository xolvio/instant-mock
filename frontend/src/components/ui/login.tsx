'use client';
import {
  getAuthorisationURLWithQueryParamsAndSetState,
  redirectToThirdPartyLogin,
} from 'supertokens-auth-react/recipe/thirdparty';
import githubLogo from '../../assets/github_logo.svg';
import microsoftLogo from '../../assets/microsoft_logo.svg';
import logo from '../../assets/xolvio_logo.png';
import {Button} from './button';
import {Card, CardContent} from './card';
import {useAuthProviders} from '../../hooks/useAuthProviders';
import {Loader2} from 'lucide-react';
import {getApiBaseUrl} from '../../config/config';

export default function Login() {
  const {providers, loading} = useAuthProviders();

  const handleSignIn = async (providerId: string) => {
    try {
      if (providerId === 'azure') {
        const authUrl = await getAuthorisationURLWithQueryParamsAndSetState({
          thirdPartyId: 'azure',
          frontendRedirectURI: `${getApiBaseUrl()}/auth/callback/azure`,
        });
        window.location.assign(authUrl);
      } else {
        await redirectToThirdPartyLogin({thirdPartyId: providerId});
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const getProviderLogo = (providerId: string) => {
    switch (providerId) {
      case 'github':
        return githubLogo;
      case 'azure':
        return microsoftLogo;
      default:
        return null;
    }
  };

  const NoProvidersMessage = () => (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">
        No authentication providers configured.
      </p>
      <p className="text-sm">
        Please follow the{' '}
        <a
          href="https://github.com/xolvio/instant-mock/blob/main/docs/oauth-setup.md"
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          OAuth setup guide
        </a>{' '}
        to configure GitHub or Microsoft authentication.
      </p>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-[400px] p-6">
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <img
              src={logo}
              alt="Logo"
              className="object-cover cursor-pointer"
            />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
            <p className="text-sm text-muted-foreground">
              Log in to InstantMock to start mocking.
            </p>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : providers.length > 0 ? (
              providers.map((provider) => (
                <Button
                  key={provider.id}
                  variant="outline"
                  className="relative w-full h-10 px-4 py-2"
                  onClick={() => handleSignIn(provider.id)}
                >
                  <img
                    src={getProviderLogo(provider.id)}
                    alt={`${provider.name} logo`}
                    className="absolute left-4 h-[21px] w-[21px]"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    Continue with {provider.name}
                  </span>
                </Button>
              ))
            ) : (
              <NoProvidersMessage />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
