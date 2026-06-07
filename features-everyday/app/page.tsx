"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push('/pdfUpload');
  }, []);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black font-sans text-white p-6">
      <button onClick={() => {router.push('/pdfUpload')}} className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-all active:scale-95"></button>
    </div>
  );
}
