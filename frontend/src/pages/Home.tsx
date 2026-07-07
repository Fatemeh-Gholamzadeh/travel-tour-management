import React, { useState, useEffect } from "react";
import { toursApi } from "../api/tour.api";
import type { Tour } from "../types/tour.type";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Unknown error";
}

const Home: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, logout } = useAuthStore();

  const [sort, setSort] = useState<string>("name");
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const response = await toursApi.getAll({
        is_active: true,
        limit,
        page,
        sort,
      });
      setTours(response.tours);
      setTotalPages(response.total_pages);
      setError(null);
    } catch (err: unknown) {
      console.error("❌ Error:", err);
      const errorMessage = getErrorMessage(err);
      setError(`Failed to load tours: ${errorMessage}`);
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [page, sort]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary-700 font-medium text-lg">
            Loading tours...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600 max-w-md bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <svg
            className="h-16 w-16 mx-auto mb-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg">{error}</p>
          <p className="text-sm mt-2 text-gray-500">Please try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full font-sans">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-white/30 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌴</span>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-sky-400 bg-clip-text text-transparent">
              Tour Management
            </h1>
          </div>
          <div className="flex gap-3 items-center flex-wrap justify-end">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition text-sm font-medium"
                >
                  👤 Profile
                </Link>
                <Link
                  to="/my-bookings"
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition text-sm font-medium"
                >
                  📝 My Bookings
                </Link>
                {user?.is_admin && (
                  <>
                    <Link
                      to="/admin/tours"
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition text-sm font-medium"
                    >
                      🗺️ Tours
                    </Link>
                    <Link
                      to="/admin/bookings"
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition text-sm font-medium"
                    >
                      📋 Bookings
                    </Link>
                    <Link
                      to="/admin/users"
                      className="px-4 py-2 bg-pink-100 text-pink-700 rounded-xl hover:bg-pink-200 transition text-sm font-medium"
                    >
                      👥 Users
                    </Link>
                  </>
                )}
                <button
                  onClick={logout}
                  className="px-5 py-2 bg-red-500/80 text-white rounded-xl hover:bg-red-600 transition text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-white/80 backdrop-blur-sm text-primary-700 rounded-xl hover:bg-white border border-primary-200 transition-all text-sm font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="inline-block bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm">
          <p className="text-primary-600 font-medium text-lg">
            ✈️ Discover the best tours with us
          </p>
        </div>
      </section>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm font-medium text-gray-700 self-center">
            Sort by:
          </span>
          <button
            onClick={() => {
              setSort("name");
              setPage(1);
            }}
            className={`px-4 py-2 text-sm rounded-xl transition ${
              sort === "name"
                ? "bg-primary-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Name
          </button>
          <button
            onClick={() => {
              setSort("price");
              setPage(1);
            }}
            className={`px-4 py-2 text-sm rounded-xl transition ${
              sort === "price"
                ? "bg-primary-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Price
          </button>

          <span className="text-sm text-gray-400 self-center ml-auto">
            {tours.length} of {totalPages} pages
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/50 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-primary-400 via-sky-300 to-summer-yellow" />
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-800 group-hover:text-primary-700 transition">
                    {tour.name}
                  </h2>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      tour.is_active
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {tour.is_active ? "✓ Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <span className="text-lg">📍</span>
                  <span className="text-sm font-medium">
                    {tour.destination}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {tour.description}
                </p>
                <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-100/80">
                  <div>
                    <span className="text-sm text-gray-500">Price</span>
                    <p className="text-xl font-bold text-primary-600">
                      ${new Intl.NumberFormat("en-US").format(tour.price)}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        USD
                      </span>
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-gray-500">Seats</span>
                    <p className="text-lg font-semibold text-gray-700">
                      🪑 {tour.available_seats}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                  <span>
                    📅 {new Date(tour.start_date).toLocaleDateString("en-US")}
                  </span>
                  <span>→</span>
                  <span>
                    {new Date(tour.end_date).toLocaleDateString("en-US")}
                  </span>
                </div>
                <Link
                  to={`/book/${tour.id}`}
                  className={`w-full block text-center py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    tour.available_seats === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                      : "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg hover:from-primary-600 hover:to-primary-700 active:scale-95"
                  }`}
                >
                  {tour.available_seats === 0 ? "❌ Sold Out" : "✨ Book Now"}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {tours.length === 0 && (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl">
            <span className="text-5xl block mb-4">🏝️</span>
            <p className="text-gray-500 text-lg">No tours found</p>
            <p className="text-sm text-gray-400 mt-1">
              New tours will be added soon
            </p>
          </div>
        )}

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-sm text-gray-400/80 border-t border-white/30 backdrop-blur-sm bg-white/30">
        <p>© 2025 Tour Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
