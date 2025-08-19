import { nhost } from "../nhost";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";

// GraphQL mutation to insert user profile
const INSERT_USER_PROFILE = gql`
  mutation InsertUserProfile($auth_id: uuid!, $user_name: String!, $user_email: String!) {
    insert_users_app_one(object: { auth_id: $auth_id, user_name: $user_name, user_email: $user_email }) {
      user_id
      user_name
      user_email
    }
  }
`;

function Signup({ client }) {
  const [userName, setUserName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [insertUserProfile] = useMutation(INSERT_USER_PROFILE);

  const handleSignup = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      //  Signup with Nhost Auth
      const { session, error: authError } = await nhost.auth.signUp({ email, password });

      if (authError) {
        if (authError.message.toLowerCase().includes('already exists')) {
          setError('An account with this email already exists. Try signing in instead.');
        } else {
          setError(authError.message || 'An error occurred during signup.');
        }
        return;
      }

      //  Insert into users_app table
      const authUser = nhost.auth.getUser();
      await insertUserProfile({
        variables: {
          auth_id: authUser.id,
          user_name: userName,
          user_email: authUser.email
        }
      });

      console.log('User signed up successfully and profile created');
      navigate('/chatinbox');

    } catch (err) {
      setError('Something went wrong. Please try again later.');
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">Create your account</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div>
            <button
              onClick={handleSignup}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Up
            </button>
          </div>
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
