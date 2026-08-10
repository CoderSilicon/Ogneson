import { PeriodicData } from "@/data/elementData";
import { CATEGORY_COLORS } from "@/data/elements";
import { CATEGORY_DESCRIPTIONS } from "@/data/categories";
import Link from "next/link";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

// Helper function to parse $...$ inline LaTeX formulas in strings
function renderLatexInText(text: string) {
  if (!text) return null;

  // Split string by $...$ regex pattern
  const parts = text.split(/(\$[^\$]+\$)/g);

  return parts.map((part, index) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      // Strip outer '$' symbols and render with KaTeX
      const mathContent = part.slice(1, -1);
      return <InlineMath key={index} math={mathContent} />;
    }
    // Return standard text string
    return part;
  });
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  
  const info = CATEGORY_DESCRIPTIONS[normalizedSlug];
  const categoryElements = PeriodicData.filter(
    (el) => el.category.replace(/-/g, " ").toLowerCase() === normalizedSlug.replace(/-/g, " ")
  );

  const bgClass = CATEGORY_COLORS[normalizedSlug as keyof typeof CATEGORY_COLORS] || "bg-zinc-800";

  return (
    <div className={`min-h-screen text-white ${bgClass} p-6 md:p-12 lg:p-20`}>
      <div className="mx-auto max-w-7xl">
        <header className="mb-16 py-4">
          <span className="lexend-600 text-[10px] tracking-[0.4em] opacity-60 block mb-2">
            Block: <span className="opacity-100">{info?.system_note || "Unknown"}</span>
          </span>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl lexend-800 tracking-tighter leading-none">
            {info?.title || normalizedSlug.replace(/-/g, " ")}
          </h1>

          {/* Render description with LaTeX support */}
          <p className="mt-6 lexend-300 text-lg md:text-xl opacity-80 max-w-3xl leading-relaxed italic whitespace-pre-line">
            {info?.description 
              ? renderLatexInText(info.description) 
              : "Chemical data currently being indexed for this group."}
          </p>
        </header>

        {/* Elements Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categoryElements.map((el) => (
            <Link key={el.id} href={`/element/${el.id}`}>
              <div className="group border border-black p-6 hover:bg-black transition-all cursor-pointer relative overflow-hidden">
                <span className="absolute -right-2 -bottom-4 text-8xl lexend-900 opacity-5 group-hover:opacity-10 transition-opacity">
                  {el.symbol}
                </span>

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <span className="lexend-700 text-sm opacity-50">
                    {el.id.toString().padStart(3, '0')}
                  </span>
                  <div className="w-8 h-px bg-white/40 group-hover:w-12 transition-all" />
                </div>

                <div className="relative z-10">
                  <h3 className="lexend-800 text-3xl md:text-4xl mb-1">{el.symbol}</h3>
                  <p className="lexend-400 text-[10px] md:text-xs tracking-widest opacity-70">
                    {el.name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
