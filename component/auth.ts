// auth.ts
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, ActionCodeSettings } from 'firebase/auth';
import { auth } from '../component/auth';  // Ensure you import the initialized auth instance

// Function to send the login email link
export const sendLoginEmailLink = async (email: string) => {
  const actionCodeSettings: ActionCodeSettings = {
    // Customize the action code settings (such as the URL where users will be redirected after email verification)
    url: 'https://your-app-url.com/finishSignUp?email=' + email,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Store the email locally (so it can be used to complete the sign-in process)
    window.localStorage.setItem('emailForSignIn', email);
    alert('Check your email for the login link!');
  } catch (error) {
    console.error(error);
    alert('Error sending login email.');
  }
};

// Function to handle the sign-in link
export const completeSignInWithEmailLink = async (email: string, emailLink: string) => {
  try {
    const result = await signInWithEmailLink(auth, email, emailLink);
    // User is now signed in
    const user = result.user;
    console.log('User signed in:', user);
    return user;
  } catch (error) {
    console.error(error);
    alert('Error completing sign-in.');
  }
};
