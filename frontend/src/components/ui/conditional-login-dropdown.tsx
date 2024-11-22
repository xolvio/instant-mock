import {config, getApiBaseUrl} from '../../config/config';
import {LogIn, LogOut} from 'lucide-react';
import {Avatar, AvatarFallback, AvatarImage} from './avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {useNavigate} from 'react-router';
import {SuperTokensWrapper} from 'supertokens-auth-react';
import Session, {
  useSessionContext,
} from 'supertokens-auth-react/recipe/session';
import {useEffect, useState} from 'react';

const LoginDropdownWithAuthRequired = () => {
  const [avatarUrl, setAvatarUrl] = useState<string>('/anonymous-avatar.svg');
  const navigate = useNavigate();

  async function handleSignOut() {
    await Session.signOut();
    navigate('/auth');
  }

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/avatar`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (data.avatarUrl) {
          setAvatarUrl(data.avatarUrl);
        }
      } catch (err) {
        console.error('Error fetching avatar:', err);
      }
    };

    fetchAvatar();
  }, []);

  const sessionContext = useSessionContext();
  if (sessionContext.loading === true) return null;

  const isLoggedIn = !!sessionContext.userId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={avatarUrl} />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isLoggedIn ? (
          <DropdownMenuItem onSelect={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => navigate('/auth')}>
            <LogIn className="mr-2 h-4 w-4" />
            <span>Login</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LoginDropdownDisabled = () => {
  const [avatarUrl] = useState<string>('/anonymous-avatar.svg');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={avatarUrl} />
        </Avatar>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
};

const ConditionalLoginDropdown = () => {
  return config.requireAuth ? (
    <SuperTokensWrapper>
      <LoginDropdownWithAuthRequired />
    </SuperTokensWrapper>
  ) : (
    <LoginDropdownDisabled />
  );
};

export default ConditionalLoginDropdown;
