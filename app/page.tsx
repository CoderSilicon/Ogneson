import { Suspense } from "react";
import Header from "@/components/header";
import PeriodicTable from "@/components/periodic";

export default function Home() {
  return (
    <>
      <Header />
      <div className="flex flex-col h-screen items-center justify-center bg-[#e4e2dd] font-sans text-black dark:bg-white">
        <Suspense
          fallback={<div className="text-center mt-10 text-lg">Loading...</div>}
        >
          <PeriodicTable />
        </Suspense>
      </div>
    </>
  );
}
