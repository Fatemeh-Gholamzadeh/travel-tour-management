import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookingsApi } from "../api/booking.api";
import { Booking } from "@/types/booking.type";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred";
}

const AdminBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const data = await bookingsApi.getAllBookings();
        setBookings(data);
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setError(msg || "Failed to load bookings");
        if (msg.includes("403") || msg.includes("401")) {
          localStorage.removeItem("access_token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdating(id);
    try {
      await bookingsApi.updateStatus(id, newStatus);
      setBookings(
        bookings.map((b) =>
          b.id === id ? { ...b, status: newStatus as Booking["status"] } : b,
        ),
      );
    } catch (err: unknown) {
      alert(getErrorMessage(err) || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const handlePaymentChange = async (id: number, newPaymentStatus: string) => {
    setUpdating(id);
    try {
      await bookingsApi.updateStatus(id, "pending", newPaymentStatus);
      setBookings(
        bookings.map((b) =>
          b.id === id
            ? {
                ...b,
                payment_status: newPaymentStatus as Booking["payment_status"],
              }
            : b,
        ),
      );
    } catch (err: unknown) {
      alert(getErrorMessage(err) || "Failed to update payment status");
    } finally {
      setUpdating(null);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          All Bookings (Admin)
        </h1>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl">
            <p className="text-gray-500 text-lg">No bookings yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tour
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50/50 transition"
                  >
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {booking.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {booking.user_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>{booking.tour_name}</div>
                      <div className="text-xs text-gray-400">
                        {booking.destination}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {booking.number_of_tickets}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      ${booking.total_price}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          handleStatusChange(booking.id, e.target.value)
                        }
                        disabled={updating === booking.id}
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-primary-500 ${getStatusColor(booking.status)}`}
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={booking.payment_status}
                        onChange={(e) =>
                          handlePaymentChange(booking.id, e.target.value)
                        }
                        disabled={updating === booking.id}
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-primary-500 ${getPaymentColor(booking.payment_status)}`}
                      >
                        <option value="unpaid">unpaid</option>
                        <option value="paid">paid</option>
                        <option value="refunded">refunded</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {updating === booking.id ? (
                        <span className="text-xs text-gray-400">
                          Updating...
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
