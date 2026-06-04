"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize state with the existing URL parameter if present
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    
    // Updates the URL seamlessly without reloading the page
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white backdrop-blur-2xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-between w-full gap-3 md:gap-4">
            <div className="relative">
              <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center">
                <span className="lexend-300 font-bold text-lg md:text-2xl">
                  {/* SVG Logo remains unchanged */}
                  <svg
                    version="1.0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="62.000000pt"
                    height="61.000000pt"
                    viewBox="0 0 625.000000 626.000000"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <g transform="translate(0.000000,626.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                      <path d="M2998 4275 c-199 -240 -367 -434 -372 -431 -269 120 -433 156 -650 142 -336 -21 -599 -145 -818 -383 -204 -223 -298 -479 -298 -812 0 -283 63 -501 210 -724 45 -67 50 -80 38 -94 -7 -9 -66 -80 -131 -156 -65 -77 -116 -141 -115 -142 112 -83 272 -197 281 -201 11 -4 181 181 243 265 10 13 17 11 55 -11 311 -183 774 -201 1106 -43 424 200 673 610 673 1105 0 100 -22 254 -51 360 -27 96 -106 265 -163 344 l-44 62 296 357 297 357 459 0 459 0 -19 -21 c-10 -12 -197 -217 -415 -457 l-396 -435 65 -171 c35 -94 65 -172 67 -174 1 -1 76 22 166 52 248 83 403 95 564 45 129 -40 222 -118 276 -233 37 -78 50 -147 51 -266 1 -188 -48 -317 -167 -435 -183 -182 -450 -228 -680 -115 -114 56 -271 204 -374 353 -18 26 -35 47 -40 47 -6 0 -103 -60 -349 -216 l-23 -15 63 -91 c263 -380 492 -528 863 -557 238 -18 468 35 683 159 82 48 225 178 294 270 216 284 256 723 95 1045 -145 291 -403 475 -723 516 -52 6 -94 13 -94 15 0 3 189 214 421 470 231 256 423 472 425 479 3 7 -13 49 -35 94 l-41 81 -895 0 -895 0 -362 -435z m-804 -720 c38 -8 98 -28 134 -45 l65 -30 -20 -23 c-11 -12 -229 -267 -483 -566 l-463 -544 -29 58 c-55 107 -71 192 -72 375 -1 143 2 176 22 250 73 269 278 469 537 525 81 18 225 18 309 0z m486 -397 c27 -63 47 -128 60 -199 16 -80 13 -294 -4 -376 -82 -394 -434 -645 -813 -579 -90 15 -217 59 -229 77 -6 11 -20 -6 520 628 236 276 431 501 436 501 4 0 18 -23 30 -52z" />
                    </g>
                  </svg>
                </span>
              </div>
            </div>
            
            {/* Enabled Search input with updated opacity styling */}
            <div className="relative group max-w-md hidden md:block w-full">
              <div className="absolute -inset-0.5 bg-linear-to-r from-gray-700 to-gray-500 rounded-lg blur opacity-20 transition duration-500"></div>
              
              <div className="relative flex items-center bg-black border border-white/10 rounded-lg px-4 py-2 ring-1 ring-white/5">
                <svg className="w-4 h-4 text-white/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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