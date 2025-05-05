// app/not-found.js

'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white relative">
      <h1 className="absolute inset-0 flex items-center justify-center text-[40vw] font-extrabold text-red-600 opacity-80 blur-md select-none z-0">
        404
      </h1>

      <div className="z-10 text-center">
        <p className="text-sm font-bold">404</p>
        <p className="text-md">SORRY, WE COULDN’T FIND THIS PAGE</p>
        <Link
          href="/"
          className="mt-4 inline-block text-xl italic underline hover:opacity-80"
        >
          GO BACK
        </Link>
        <p className="mt-6 text-xs text-center opacity-70">
          THE PAGE YOU ARE LOOKING FOR DOESN’T EXIST OR AN OTHER ERROR OCCURRED.
        </p>
      </div>
    </div>
  );
}
