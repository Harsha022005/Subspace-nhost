import { nhost } from "../nhost";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { client } from "../appoloclient";

function Signup() {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const INSERT_USER = gql`
    mutation InsertUser($user_name: String!, $user_email: String!) {
      insert_users_app_one(object: { user_name: $user_name, user_email: $user_email }) {
        user_id
        user_name
      }
    }
  `;

  const handleSignup = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { session, error: authError } = await nhost.auth.signUp({ email, password });

      if (authError) {
        setError(authError.message.includes('already exists') 
          ? 'An account with this email already exists.' 
          : authError.message);
        return;
      }

    
      await client.mutate({
        mutation: INSERT_USER,
        variables: {
          user_name: userName,
          user_email: email,
        },
      });

      console.log('User signed up successfully', session);
      navigate('/chatinbox');
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-bold text-gray-900">Create your account</h2>

        <input
          type="text"
          placeholder="Username"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          className="input-field"
        />

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

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="input-field"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button onClick={handleSignup} className="btn-primary">Sign Up</button>
      </div>
    </div>
  );
}

export default Signup;
