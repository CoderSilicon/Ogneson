"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import logo from "../app/assets/logo.svg";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state with the existing URL parameter if present
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-black backdrop-blur-2xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-between w-full gap-3 md:gap-4">
            <div className="relative">
              <div className="md:w-14 md:h-14 flex items-center justify-center">
                <img src={logo.src} alt="Logo" className="w-60 h-60" />
              </div>
            </div>

            {/* Enabled Search input with updated opacity styling */}
            <div className="relative group max-w-md hidden md:block w-full">
              <div className="absolute -inset-0.5  opacity-20 transition duration-500"></div>

              <div className="relative flex items-center  rounded-lg px-4 py-2 ring-1 ">
                <svg
                  className="w-4 h-4 text-white/40 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                <input
                  type="text"
                  placeholder="Search elements"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder-white/30 w-full ml-3 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
