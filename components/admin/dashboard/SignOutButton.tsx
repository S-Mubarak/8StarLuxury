'use client';
import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <span
      className="cursor-pointer w-full text-left"
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
    >
      Sign Out
    </span>
  );
}
