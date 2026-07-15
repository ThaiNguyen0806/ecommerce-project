"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    setLoggedIn(false);
    router.push("/");
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <Link href="/" className="text-lg font-semibold text-gray-900">
        Storefront
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
          Browse
        </Link>
        {loggedIn && (
          <>
            <Link href="/sell" className="text-sm text-gray-600 hover:text-gray-900">
              Sell
            </Link>
            <Link href="/cart" className="text-sm text-gray-600 hover:text-gray-900">
              Cart
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Log Out
            </button>
          </>
        )}
        {!loggedIn && (
          <>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Log In
            </Link>
            <Link
              href="/register"
              className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}