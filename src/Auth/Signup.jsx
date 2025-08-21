import React, { useState } from "react";
import { nhost } from "../nhost";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        return;
      }

      if (!session || !session.user) {
        setError("Signup failed: No session or user returned.");
        return;
      }

      // Store details in constants
      console.log('user signed up successfully',session)
      const USER_ID = session.user.id;
      const USER_EMAIL = session.user.email;
      const USER_NAME = userName || session.user.displayName || USER_EMAIL;

      // Step 2 — Insert into users_app via GraphQL
      try {
        const data = await fetch("https://mgaffvhkvdrrhibqcqkp.hasura.ap-south-1.nhost.run/v1/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-hasura-admin-secret": "'FwfT)CtP;^$K+X@%uKKIcvl74Lc=m^0"
  },
  body: JSON.stringify({
    query: `
      mutation InsertUserApp($user_id: uuid!, $user_email: String!, $user_name: String!) {
        insert_users_app_one(object: {user_id: $user_id, user_email: $user_email, user_name: $user_name}) {
          user_id
          user_email
          user_name
        }
      }`,
    variables: {
      user_id: USER_ID,
      user_email: USER_EMAIL,
      user_name: USER_NAME
    }
  })
});

      } catch (gqlError) {
        console.error("GraphQL error:", gqlError);
        setError("Failed to sync with users_app.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "300px",
        margin: "auto",
        marginTop: "50px",
      }}
    >
      <h2>Signup</h2>

      <input
        type="text"
        placeholder="Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        disabled={loading}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <button onClick={handleSignup} disabled={loading}>
        {loading ? "Signing Up..." : "Sign Up"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Signup;
