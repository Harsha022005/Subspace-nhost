import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-indigo-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">ChatApp</h1>
      <div className="space-x-4">
        <Link
          to="/"
          className="hover:bg-indigo-500 px-3 py-2 rounded transition-colors"
        >
          Chats
        </Link>
        <Link
          to="/profile"
          className="hover:bg-indigo-500 px-3 py-2 rounded transition-colors"
        >
          Profile
        </Link>
      </div>
    </nav>
  );
}
