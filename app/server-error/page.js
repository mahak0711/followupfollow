'use client';

import Link from 'next/link';

export default function ServerError() {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-black text-white overflow-hidden">
      
      {/* Giant 505 in the background */}
      <h1 className="absolute inset-0 flex items-center justify-center text-[40vw] font-extrabold text-orange-600 opacity-80 blur-md select-none z-0">
        505
      </h1>

      {/* Foreground content */}
      <div className="z-10 text-center px-4">
        <p className="text-sm font-bold">505</p>
        <p className="text-lg md:text-xl font-semibold mt-2">
          SOMETHING WENT WRONG ON OUR END
        </p>

        <Link
          href="/"
          className="mt-4 inline-block text-xl italic underline hover:opacity-80 transition"
        >
          GO BACK
        </Link>

        <p className="mt-6 text-xs text-center text-gray-300">
          A SERVER ERROR OCCURRED. PLEASE TRY AGAIN LATER.
        </p>
      </div>
    </div>
  );
}
