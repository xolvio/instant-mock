'use client';

import {MarkGithubIcon} from '@primer/octicons-react';
import * as React from 'react';
import {redirectToThirdPartyLogin} from 'supertokens-auth-react/recipe/thirdparty';
import logo from '../../assets/xolvio_logo.png';
import {Button} from './button';
import {Card, CardContent} from './card';

export default function Login() {
  const handleSignIn = async (providerId: string) => {
    try {
      await redirectToThirdPartyLogin({thirdPartyId: providerId});
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-[400px] p-6">
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <img
              src={logo}
              alt="Logo"
              className=" object-cover cursor-pointer"
            />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
            <p className="text-sm text-muted-foreground">
              Log in to InstantMock to start mocking.
            </p>
          </div>
          <div className="space-y-4">
            {/*{githubProvider.getButton('github')}*/}
            <Button
              variant="outline"
              className="relative w-full justify-center gap-2"
              type="button"
              onClick={() => handleSignIn('github')}
            >
              <MarkGithubIcon size={16} />
              Continue with GitHub
            </Button>
          </div>
          {/*<div className="relative">*/}
          {/*  <div className="absolute inset-0 flex items-center">*/}
          {/*    <span className="w-full border-t" />*/}
          {/*  </div>*/}
          {/*  /!*<div className="relative flex justify-center text-xs uppercase">*!/*/}
          {/*  /!*  <span className="bg-background px-2 text-muted-foreground">*!/*/}
          {/*  /!*    OR*!/*/}
          {/*  /!*  </span>*!/*/}
          {/*  /!*</div>*!/*/}
          {/*</div>*/}
          {/*<div className="space-y-4">*/}
          {/*  <div className="space-y-2">*/}
          {/*    <Input*/}
          {/*      id="email"*/}
          {/*      placeholder="Email address*"*/}
          {/*      type="email"*/}
          {/*      required*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*  <div className="space-y-2">*/}
          {/*    <div className="relative">*/}
          {/*      <Input*/}
          {/*        id="password"*/}
          {/*        placeholder="Password*"*/}
          {/*        type={showPassword ? 'text' : 'password'}*/}
          {/*        required*/}
          {/*      />*/}
          {/*      <Button*/}
          {/*        type="button"*/}
          {/*        variant="ghost"*/}
          {/*        size="sm"*/}
          {/*        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"*/}
          {/*        onClick={() => setShowPassword(!showPassword)}*/}
          {/*      >*/}
          {/*        {showPassword ? (*/}
          {/*          <span className="sr-only">Hide password</span>*/}
          {/*        ) : (*/}
          {/*          <span className="sr-only">Show password</span>*/}
          {/*        )}*/}
          {/*        <svg*/}
          {/*          viewBox="0 0 24 24"*/}
          {/*          strokeWidth="2"*/}
          {/*          strokeLinecap="round"*/}
          {/*          strokeLinejoin="round"*/}
          {/*          className="h-4 w-4 fill-none stroke-current"*/}
          {/*        >*/}
          {/*          {showPassword ? (*/}
          {/*            <>*/}
          {/*              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />*/}
          {/*              <line x1="1" y1="1" x2="23" y2="23" />*/}
          {/*            </>*/}
          {/*          ) : (*/}
          {/*            <>*/}
          {/*              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />*/}
          {/*              <circle cx="12" cy="12" r="3" />*/}
          {/*            </>*/}
          {/*          )}*/}
          {/*        </svg>*/}
          {/*      </Button>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*  <a*/}
          {/*    className="inline-block text-sm text-[#74BE9B] hover:underline"*/}
          {/*    href="#"*/}
          {/*  >*/}
          {/*    Forgot password?*/}
          {/*  </a>*/}
          {/*  <Button className="w-full">Continue</Button>*/}
          {/*</div>*/}
          {/*<div className="text-center text-sm">*/}
          {/*  Don&apos;t have an account?{' '}*/}
          {/*  <a className="text-[#74BE9B] hover:underline" href="#">*/}
          {/*    Sign up*/}
          {/*  </a>*/}
          {/*</div>*/}
        </CardContent>
      </Card>
    </div>
  );
}
