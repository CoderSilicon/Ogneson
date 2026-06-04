"use client";
import { ELEMENTS, CATEGORY_COLORS } from "@/data/elements";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; 

interface ElementCardProps {
  element: {
    id: number;
    symbol: string;
    name: string;
    number: number;
    category: string;
    row: number;
    col: number;
  };
  colorClass: string;
  isDimmed?: boolean; 
}

function ElementCard({ element, colorClass, isDimmed }: ElementCardProps) {
  return (
    <Link href={`/element/${element.id}`} className={`w-full transition-opacity duration-300 ${isDimmed ? "opacity-15 pointer-events-none" : "opacity-100"}`}>
      <div
        className={`
      w-full aspect-square
      p-2
      relative flex flex-col justify-between items-start
      transition-transform duration-200 border-2 hover:border-black hover:text-black/90
      cursor-pointer
     ${colorClass}
      text-white
    `}
      >
        <div className="flex justify-between w-full">
          <span className="text-xs md:text-sm font-mono opacity-90 leading-none lexend-300">
            {element.number}
          </span>
        </div>

        <div className="mt-auto mb-1">
          <span className="text-2xl md:text-3xl font-bold tracking-tighter leading-none block lexend-600">
            {element.symbol}
          </span>
        </div>

        <div className="w-full border-t hover:border-none border-white/20 pt-1">
          <p className="text-xs md:text-md truncate opacity-90 font-medium lexend-400">
            {element.name}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function PeriodicTable() {
  const searchParams = useSearchParams();
  const query = searchParams.get("search")?.toLowerCase() || "";

  // Helper to determine if an element matches our filter
  const matchesSearch = (element: typeof ELEMENTS[0]) => {
    if (!query) return true;
    return (
      element.name.toLowerCase().includes(query) ||
      element.symbol.toLowerCase().includes(query) ||
      element.number.toString().includes(query)
    );
  };

  return (
    <>
      <div className="min-h-screen p-2 md:p-4 lg:p-8">
        <div className="overflow-x-auto">
          
          {/* Mobile Layout: Completely filtered to save vertical space */}
          <div className="inline-grid gap-0.5 p-2 md:p-4 grid-cols-6 md:hidden ">
            {ELEMENTS.filter(matchesSearch).map((element) => (
              <div key={element.id} className="md:hidden">
                <ElementCard
                  element={element}
                  colorClass={
                    CATEGORY_COLORS[element.category as keyof typeof CATEGORY_COLORS] || 
                    "bg-gray-100 border-gray-400 text-gray-900"
                  }
                />
              </div>
            ))}
          </div>

          {/* Desktop Layout: Dims non-matching elements to keep the periodic table shape intact! */}
          <div
            className="hidden md:inline-grid gap-0.5 p-4 "
            style={{
              gridTemplateColumns: "repeat(18, minmax(60px, 1fr))",
            }}
          >
            {ELEMENTS.map((element) => {
              const active = matchesSearch(element);
              return (
                <div
                  key={element.id}
                  style={{
                    gridColumn: element.col,
                    gridRow: element.row,
                  }}
                >
                  <ElementCard
                    element={element}
                    isDimmed={!active}
                    colorClass={
                      CATEGORY_COLORS[element.category as keyof typeof CATEGORY_COLORS] || 
                      "bg-gray-100 border-gray-400 text-gray-900"
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Section remains unchanged */}
        <div className="mt-8 md:mt-12 max-w-5xl mx-auto">
          <div className="bg-white/80 p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 lexend-400">
              Element Categories
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {Object.entries(CATEGORY_COLORS).map(([category, colorClass]) => (
                <Link href={`elementCatogories/${category}`} key={category}>
                  <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3">
                    <div className={`w-5 h-5 md:w-6 md:h-6 ${colorClass} border border-white/20`} />
                    <span className="text-xs md:text-sm text-gray-700 font-medium capitalize">
                      {category.replace("-", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}