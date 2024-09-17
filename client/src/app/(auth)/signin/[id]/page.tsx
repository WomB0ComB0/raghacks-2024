'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  getAuthTypes,
  getDefaultSignInView,
  getRedirectMethod,
  getViewTypes,
} from '@/utils/auth/settings';
import { createClient } from '@/utils/supabase/client';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  EmailSignIn,
  ForgotPassword,
  OauthSignIn,
  PasswordSignIn,
  SignUp,
  UpdatePassword,
} from '../../../../components/ui/auth';

export default function SignIn({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { disable_button: boolean };
}) {
  const [error, setError] = useState<string | null>(null);
  const [authConfig, setAuthConfig] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { allowOauth, allowEmail, allowPassword } = await getAuthTypes();
        const viewTypes = await getViewTypes();
        const redirectMethod = await getRedirectMethod();

        let viewProp: string;

        if (typeof params.id === 'string' && viewTypes.includes(params.id)) {
          viewProp = params.id;
        } else {
          const preferredSignInView = localStorage.getItem('preferredSignInView') || null;
          viewProp = await getDefaultSignInView(preferredSignInView);
          router.push(`/signin/${viewProp}`);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && viewProp !== 'update_password') {
          router.push('/my-learning');
        } else if (!user && viewProp === 'update_password') {
          router.push('/signin');
        } else {
          setAuthConfig({
            viewProp,
            allowOauth,
            allowEmail,
            allowPassword,
            redirectMethod,
            disableButton: searchParams.disable_button,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError('An error occurred while loading the sign-in page. Please try again later.');
      }
    };

    initializeAuth();
  }, [params.id, searchParams.disable_button, router, supabase.auth]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!authConfig) {
    return null; // Return null while loading
  }

  const { viewProp, allowOauth, allowEmail, allowPassword, redirectMethod, disableButton } =
    authConfig;

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="flex justify-center w-screen h-screen mx-auto my-auto">
        <div className="flex flex-col justify-between w-full max-w-lg p-3 m-auto">
          <Card className="w-full max-w-md overflow-hidden bg-white shadow-xl rounded-3xl">
            <CardHeader className="p-6">
              <div className="flex justify-center mb-4">
                <Image
                  src={'/assets/images/logo.png'}
                  alt="MediGlossary Logo"
                  width={100}
                  height={100}
                  className="p-2 bg-white rounded-full"
                  priority
                />
              </div>
              <CardTitle className="text-2xl font-bold text-center text-white sr-only">
                {viewProp === 'forgot_password'
                  ? 'Reset Password'
                  : viewProp === 'update_password'
                    ? 'Update Password'
                    : viewProp === 'signup'
                      ? 'Sign Up'
                      : 'Sign In'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {viewProp === 'password_signin' && (
                <PasswordSignIn allowEmail={allowEmail} redirectMethod={redirectMethod} />
              )}
              {viewProp === 'email_signin' && (
                <EmailSignIn
                  allowPassword={allowPassword}
                  redirectMethod={redirectMethod}
                  disableButton={disableButton}
                />
              )}
              {viewProp === 'forgot_password' && (
                <ForgotPassword
                  allowEmail={allowEmail}
                  redirectMethod={redirectMethod}
                  disableButton={disableButton}
                />
              )}
              {viewProp === 'update_password' && <UpdatePassword redirectMethod={redirectMethod} />}
              {viewProp === 'signup' && (
                <SignUp allowEmail={allowEmail} redirectMethod={redirectMethod} />
              )}
              {viewProp !== 'update_password' && viewProp !== 'signup' && allowOauth && (
                <>
                  <Separator className={`bg-white h-[0.125rem] w-full`} />
                  <OauthSignIn />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/*
        TODO: Come back to this later
      */}
    </div>
  );
}
