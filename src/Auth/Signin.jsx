import React, { useState } from "react";
import { useEffect } from "react";
import { nhost } from "../nhost";
import { useNavigate } from "react-router-dom";
import Signup from "./Signup";

function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

   useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await nhost.auth.isAuthenticatedAsync();
      if (isAuthenticated) {
        console.log('User is already authenticated, redirecting to chat inbox');
        navigate('/chatinbox');
      }
    };

    checkAuth();
  }, [navigate]);
  

  const handleSignin = async () => {

    
    const { session, error } = await nhost.auth.signIn({ email, password });
    if (error) {
      setError(error.message);
      console.log('Error signing in:', error);
    } else {
      console.log('User signed in successfully', session);
      navigate('/chatinbox');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">Sign in to your account</h2>
        </div>
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button
              onClick={handleSignin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </button>
          </div>
          <div className="text-center">
            <button
              onClick={() => navigate('/signup')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;