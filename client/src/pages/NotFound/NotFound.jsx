import React from "react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="text-6xl font-bold text-zinc-800 mb-4">
        <span className="text-red-500">404</span>  
      </div>
      <div className="text-xl font-medium text-zinc-600 mb-8">
        Oops! Looks like you took a wrong turn into the void.  
      </div>
      <img
        src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"  
        alt="Confused Cat"
        className="w-80 h-80 mb-6 rounded-lg"
      />
      <p className="text-md text-zinc-600 mb-8">
        We couldn't find the page you're looking for.  
        Maybe it's hiding, or maybe it's just pretending to be a Schrödinger's page.  
      </p>
      <a
        href="/dashboard"
        className="inline-block bg-zinc-300 text-white font-medium py-2 px-6 rounded-lg hover:bg-zinc-400 transition duration-300"
      >
        Take Me Home 🏠  
      </a>
      <p className="mt-6 text-sm text-zinc-500">
        P.S. If you see this page too often, you might be part of the simulation.  
      </p>
    </div>
  );
};

export default NotFoundPage;
