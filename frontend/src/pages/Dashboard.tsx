import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dashboardApi } from "../api/dashboard.api";
import { useAuthStore } from "../store/authStore";

interface DashboardStats {
  active_tours: number;
  total_bookings: number;
  today_bookings: number;
  popular_destinations: { destination: string; count: number }[];
  monthly_revenue: number;
  total_revenue: number;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred";
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats(token);
        setStats(data);
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage || "Failed to load dashboard");

        if (errorMessage.includes("401") || errorMessage.includes("403")) {
          localStorage.removeItem("access_token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary-700 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No data available</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-blue-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            to="/profile"
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition"
          >
            👤 Profile
          </Link>
          <Link
            to="/my-bookings"
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition"
          >
            📝 My Bookings
          </Link>
          {user?.is_admin && (
            <>
              <Link
                to="/admin/tours"
                className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition"
              >
                🗺️ Manage Tours
              </Link>
              <Link
                to="/admin/bookings"
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition"
              >
                📋 Manage Bookings
              </Link>
              <Link
                to="/admin/users"
                className="px-4 py-2 bg-pink-100 text-pink-700 rounded-xl hover:bg-pink-200 transition"
              >
                👥 Manage Users
              </Link>
            </>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Tours</p>
                <p className="text-3xl font-bold text-primary-600">
                  {stats.active_tours}
                </p>
              </div>
              <span className="text-4xl">🌍</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-3xl font-bold text-primary-600">
                  {stats.total_bookings}
                </p>
              </div>
              <span className="text-4xl">📋</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Bookings</p>
                <p className="text-3xl font-bold text-primary-600">
                  {stats.today_bookings}
                </p>
              </div>
              <span className="text-4xl">📅</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Revenue</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {formatCurrency(stats.monthly_revenue)}
                </p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🔥 Popular Destinations
            </h2>
            {stats.popular_destinations.length === 0 ? (
              <p className="text-gray-500 text-sm">No bookings yet</p>
            ) : (
              <ul className="space-y-3">
                {stats.popular_destinations.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border-b border-gray-100 pb-2"
                  >
                    <span className="text-gray-700">{item.destination}</span>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                      {item.count} bookings
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              💰 Total Revenue
            </h2>
            <div className="text-center py-8">
              <p className="text-5xl font-bold text-emerald-600">
                {formatCurrency(stats.total_revenue)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                All-time revenue from confirmed bookings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
