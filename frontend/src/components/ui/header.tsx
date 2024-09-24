import {CircleUser} from 'lucide-react';
import React from 'react';
import {useNavigate} from 'react-router';
import logo from '../../assets/logo.png';
import {Button} from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

const Header = () => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleLogoClick = () => {
    navigate('/graphs');
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Add an onClick to the logo to navigate to /graphs */}
      <img
        src={logo}
        alt="Logo"
        className="h-14 w-24 object-cover cursor-pointer" // Add cursor pointer to indicate it's clickable
        onClick={handleLogoClick}
      />
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial"></form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSettingsClick}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
