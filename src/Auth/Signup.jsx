import React, { useState } from "react";
import { nhost } from "../nhost";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");
    setLoading(true);

    try {
      // Step 1 — Sign up with Nhost Auth
      const { session, error: authError } = await nhost.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!session || !session.user) {
        setError("Signup failed: No session or user returned.");
        setLoading(false);
        return;
      }

      const USER_ID = session.user.id;
      const USER_EMAIL = session.user.email;
      const USER_NAME = userName || session.user.displayName || USER_EMAIL;

      // Step 2 — Insert into users_app via GraphQL
      const { data, error: gqlError } = await nhost.graphql.request(
        `
        mutation InsertUserApp($user_id: uuid!, $user_email: String!, $user_name: String!) {
          insert_users_app_one(object: { user_id: $user_id, user_email: $user_email, user_name: $user_name }) {
            user_id
            user_email
            user_name
          }
        }
        `,
        {
          user_id: USER_ID,
          user_email: USER_EMAIL,
          user_name: USER_NAME,
        }
      );

      if (gqlError) {
        console.error("GraphQL error:", gqlError);
        setError("Failed to insert user info. Please try again.");
      } else {
        console.log("User inserted successfully:", data);
        // Navigate to chat inbox after successful signup
        navigate("/chatinbox");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-96 flex flex-col gap-5">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-4">
          Get started with your new account.
        </p>

        <input
          type="text"
          placeholder="Full Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold shadow-md transition duration-200 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          }`}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        {error && (
          <p className="text-red-500 text-center text-sm font-medium mt-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;