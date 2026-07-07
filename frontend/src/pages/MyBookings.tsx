import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookingsApi, Booking } from "../api/booking.api";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred";
}

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const data = await bookingsApi.getMyBookings();
        setBookings(data);
      } catch (err: unknown) {
        setError(getErrorMessage(err) || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "unpaid":
        return "bg-yellow-100 text-yellow-700";
      case "refunded":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary-700">Loading bookings...</p>
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

  return (
    <div className="min-h-screen bg-blue-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl">
            <p className="text-gray-500 text-lg">You have no bookings yet.</p>
            <a href="/" className="text-primary-600 hover:underline">
              Browse tours
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md"
              >
                <div className="flex flex-wrap justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {booking.tour_name}
                    </h3>
                    <p className="text-gray-600">📍 {booking.destination}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(booking.booking_date).toLocaleDateString(
                        "en-US",
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Tickets: {booking.number_of_tickets} | Total: $
                      {booking.total_price}
                    </p>
                    {booking.special_requests && (
                      <p className="text-sm text-gray-500 mt-1">
                        Note: {booking.special_requests}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentColor(booking.payment_status)}`}
                    >
                      {booking.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
