import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { nhost } from "./nhost";
import Navbar from './navbar';

// GraphQL query to get a single user by ID
const GET_USER_PROFILE = gql`
  query GetUserProfile($user_id: uuid!) {
    users_app(where: { user_id: { _eq: $user_id } }) {
      user_id
      user_name
      user_email
    }
  }
`;

export default function Profile() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = nhost.auth.getUser();
    if (user) setUserId(user.id);
  }, []);

  const { data, loading, error } = useQuery(GET_USER_PROFILE, {
    variables: { user_id: userId },
    skip: !userId,
  });

  if (!userId) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Please login to see your profile.</p>
      </div>
    </>
  );

  if (loading) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading profile...</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-red-500">Error loading profile. Please try again later.</p>
      </div>
    </>
  );

  const user = data?.users_app[0];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto my-10">
          <div className="bg-indigo-600 p-6 text-white text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">Your Profile</h2>
            <p className="mt-2 text-indigo-100">Manage your account information</p>
          </div>
          <div className="p-6 sm:p-8">
            {user ? (
              <div className="space-y-6">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-indigo-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-500">User Name</p>
                    <p className="text-lg font-semibold text-gray-900">{user.user_name}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-indigo-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900">{user.user_email}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-indigo-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="text-lg font-semibold text-gray-900 break-all">{user.user_id}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-xl text-gray-500">No profile data found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}