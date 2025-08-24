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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await nhost.auth.isAuthenticatedAsync();
      if (isAuthenticated) {
        const authUser = nhost.auth.getUser();
        try {
          const { data } = await client.query({
            query: GET_USER_PROFILE,
            variables: { email: authUser.email },
          });
          if (data?.users_app?.length > 0) {
            navigate("/chatinbox");
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          navigate("/chatinbox"); 
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignin = async () => {
    setError("");
    setLoading(true); 
    try {
      const {error: authError } = await nhost.auth.signIn({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      navigate("/chatinbox");
    } catch (err) {
      console.error("Signin error:", err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-center text-4xl font-extrabold text-gray-900">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Sign in to continue to your account.
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium text-center">{error}</p>
        )}

        <button
          onClick={handleSignin}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl text-white font-bold text-lg shadow-md transition duration-300 transform ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div className="text-center">
          <button
            onClick={() => navigate("/signup")}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-all duration-200"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signin;