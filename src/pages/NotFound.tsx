import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 py-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 max-w-2xl mx-4">
        {/* 404 Number with animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
            404
          </h1>
        </div>

        {/* Error message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            The page you're looking for doesn't exist
          </p>
          <p className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-2 rounded-lg inline-block">
            {location.pathname}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="/" 
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            🏠 Return to Home
          </a>
          <button 
            onClick={() => window.history.back()} 
            className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transform hover:scale-105 transition-all duration-200 border border-gray-200"
          >
            ⬅️ Go Back
          </button>
        </div>

        {/* Additional helpful info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Need help? Try these:</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Check the URL</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">Use navigation menu</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">Contact support</span>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-10 left-10 text-6xl animate-bounce">🚀</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-bounce animation-delay-1000">💫</div>
      <div className="absolute top-1/2 left-10 text-4xl animate-spin animation-delay-2000">⚡</div>
      <div className="absolute top-1/2 right-10 text-4xl animate-spin animation-delay-3000">🌟</div>
    </div>
  );
};

export default NotFound;
