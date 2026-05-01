"use client";

import { useAuth } from "@clerk/nextjs";
import { UserButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HeaderAuth() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex items-center gap-6">
      {isSignedIn && (
        <Link
          href="/scriptwriter"
          className="text-gray-400 text-sm hover:text-white transition-colors"
        >
          AI-сценарист
        </Link>
      )}
      <div className="flex items-center gap-3">
        {!isSignedIn ? (
          <SignInButton mode="modal">
            <button className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-[#1e1e1e]">
              Войти
            </button>
          </SignInButton>
        ) : (
          <UserButton />
        )}
      </div>
    </div>
  );
}
