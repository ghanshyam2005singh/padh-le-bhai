import { useEffect } from 'react';
import { completeSignInWithEmailLink } from '@/component/auth'; // Import the function

const FinishSignUp = () => {
  useEffect(() => {
    const email = localStorage.getItem('emailForSignIn');
    if (email) {
      completeSignInWithEmailLink(email);
    }
  }, []);

  return <p>Finishing sign-up...</p>;
};

export default FinishSignUp;
