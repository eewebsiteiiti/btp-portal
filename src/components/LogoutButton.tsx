"use client";
import React from 'react'
import { signOut } from "next-auth/react";

const LogoutButton = () => {
  return (
    <button
      onClick={() => signOut()} // Redirects to login after logout
      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
    >
      Logout
    </button>
  )
}

export default LogoutButton