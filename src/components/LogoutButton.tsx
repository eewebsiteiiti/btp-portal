"use client";
import React from 'react'
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const LogoutButton = () => {
  return (
    <Button
      onClick={() => signOut()}
      variant="destructive"
      size="sm"
    >
      Logout
    </Button>
  )
}

export default LogoutButton