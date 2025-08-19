import React, { useState, useEffect } from "react";
import { nhost } from "../nhost";
import { useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { client } from "../appoloclient";

const GET_USER_PROFILE = gql`
  query GetUserProfile($email: String!) {
    users_app(where: { user_email: { _eq: $email } }) {
      user_id
      user_name
    }
  }
`;

function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await nhost.auth.isAuthenticatedAsync();
      if (isAuthenticated) {
        const authUser = nhost.auth.getUser();
        const { data } = await client.query({
          query: GET_USER_PROFILE,
          variables: { email: authUser.email },
        });
        setUserName(data?.users_app[0]?.user_name || '');
        navigate('/chatinbox');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignin = async () => {
    setError('');
    try {
      const { session, error: authError } = await nhost.auth.signIn({ email, password });
      if (authError) {
        setError(authError.message);
        return;
      }

     
      const { data } = await client.query({
        query: GET_USER_PROFILE,
        variables: { email },
      });
      setUserName(data?.users_app[0]?.user_name || '');

      navigate('/chatinbox');
    } catch (err) {
      console.error('Signin error:', err);
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-bold text-gray-900">Sign in to your account</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-field"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-field"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button onClick={handleSignin} className="btn-primary">Sign In</button>
      </div>
    </div>
  );
}

export default Signin;
