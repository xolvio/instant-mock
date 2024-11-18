import {Loader2} from 'lucide-react';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {signInAndUp} from 'supertokens-web-js/recipe/thirdparty';
import {Card, CardContent} from './components/ui/card';

const CallbackHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleGithubCallback() {
      try {
        const response = await signInAndUp();

        if (response.status === 'OK') {
          console.log('User is: ', response.user);
          if (
            response.createdNewRecipeUser &&
            response.user.loginMethods.length === 1
          ) {
            // Sign-up successful
            // You can perform any additional sign-up logic here
          } else {
            // Sign-in successful
            // You can perform any additional sign-in logic here
          }
          navigate('/'); // Redirect to home or desired page
        } else if (response.status === 'SIGN_IN_UP_NOT_ALLOWED') {
          // Display a user-friendly error message
          window.alert(response.reason);
        } else {
          // Handle cases where no email is provided by the third-party provider
          window.alert(
            'No email provided by social login. Please use another form of login.'
          );
          navigate('/auth'); // Redirect back to the login page
        }
      } catch (err) {
        console.log('Github error is: ', err);
        if (err.isSuperTokensGeneralError === true) {
          // Handle custom error messages sent from your API
          // window.alert(err.message);
        } else {
          // window.alert(err.message);
        }
      }
    }

    handleGithubCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-[400px] p-6">
        <CardContent className="space-y-6">
          {/*<div className="flex justify-center">*/}
          {/*  <Image*/}
          {/*    src={logo}*/}
          {/*    alt="Logo"*/}
          {/*    className="object-cover cursor-pointer"*/}
          {/*    width={150}*/}
          {/*    height={50}*/}
          {/*  />*/}
          {/*</div>*/}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Authenticating
            </h1>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your login...
            </p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 text-[#74BE9B] animate-spin" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallbackHandler;
