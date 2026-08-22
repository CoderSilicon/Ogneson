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
    shells?: number[]; // e.g., [2, 8, 18, 7]
  };
  colorClass: string;
  isDimmed?: boolean;
}

function ElementCard({ element, colorClass, isDimmed }: ElementCardProps) {
  return (
    <Link
      href={`/element/${element.id}`}
      className={`w-full transition-opacity duration-300 ${isDimmed ? "opacity-15 pointer-events-none" : "opacity-100"}`}
    >
      <div
        className={`
          group w-full aspect-square
          p-2
          relative flex flex-col justify-between items-start
          transition-all duration-300 
          cursor-pointer
          ${colorClass}
          hover:scale-90 hover:bg-black 
          text-slate-100
          overflow-hidden
        `}
      >

        {/* Top Row: Atomic Number & Shell Stack */}
        <div className="flex justify-between w-full z-10">
          {/* <span className="text-xs md:text-sm font-medium opacity-90 leading-none lexend-300">
            {element.number}
          </span> */}

          {element.shells && (
            <div className="flex flex-col items-end gap-0.5">
              {element.shells.map((shellVal, index) => (
                <span
                  key={index}
                  className="text-[8px] md:text-[10px] leading-none opacity-50 font-medium tracking-tighter"
                >
                  {shellVal}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto mb-1 z-10 w-full flex justify-center">
          <span className="text-2xl md:text-3xl font-bold tracking-tighter leading-none block lexend-600">
            {element.symbol}
          </span>
        </div>

        <div className="w-full pt-1 z-10">
          <p className="text-[10px] md:text-xs truncate opacity-75 font-medium lexend-400 text-center">
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
  const matchesSearch = (element: (typeof ELEMENTS)[0]) => {
    if (!query) return true;
    return (
      element.name.toLowerCase().includes(query) ||
      element.symbol.toLowerCase().includes(query) ||
      element.number.toString().includes(query)
    );
  };

  return (
    <>
      <div className="min-h-screen p-2 md:p-4 lg:p-8 bg-black">
        <div className="overflow-x-auto">
          {/* Mobile Layout: Completely filtered to save vertical space */}
          <div className="inline-grid gap-0.5 p-2 md:p-4 grid-cols-6 md:hidden ">
            {ELEMENTS.filter(matchesSearch).map((element) => (
              <div key={element.id} className="md:hidden">
                <ElementCard
                  element={element}
                  colorClass={
                    CATEGORY_COLORS[
                      element.category as keyof typeof CATEGORY_COLORS
                    ] || "bg-gray-100 border-gray-400 text-gray-900"
                  }
                />
              </div>
            ))}
          </div>

          {/* Desktop Layout */}
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
                      CATEGORY_COLORS[
                        element.category as keyof typeof CATEGORY_COLORS
                      ] || "bg-gray-100 border-gray-400 text-gray-900"
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Section remains unchanged */}
        <div className="mt-8 md:mt-12 max-w-5xl mx-auto">
          <div className="bg-black p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 lexend-400">
              Element Categories
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {Object.entries(CATEGORY_COLORS).map(([category, colorClass]) => (
                <Link href={`elementCatogories/${category}`} key={category}>
                  <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 lexend-300">
                    <div className={`w-5 h-5 md:w-6 md:h-6 ${colorClass} `} />
                    <span className="text-xs md:text-sm text-slate-200 capitalize">
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
