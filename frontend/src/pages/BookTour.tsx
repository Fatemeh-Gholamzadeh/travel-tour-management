import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toursApi } from "../api/tour.api";
import { bookingsApi } from "../api/booking.api";
import type { Tour } from "../types/tour.type";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred";
}

const BookTour: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [tickets, setTickets] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ tickets?: string }>({});

  useEffect(() => {
    const fetchTour = async () => {
      if (!id) {
        setError("Tour ID is missing");
        setLoading(false);
        return;
      }
      try {
        const data = await toursApi.getById(parseInt(id));
        setTour(data);
      } catch (err: unknown) {
        setError(getErrorMessage(err) || "Failed to load tour");
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const validate = (): boolean => {
    const newErrors: { tickets?: string } = {};
    if (tickets < 1) newErrors.tickets = "Minimum 1 ticket is required";
    if (tour && tickets > tour.available_seats) {
      newErrors.tickets = `Only ${tour.available_seats} seats available`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!id) {
      setError("Tour ID is missing");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await bookingsApi.create({
        tour_id: parseInt(id),
        number_of_tickets: tickets,
        special_requests: specialRequests,
      });
      navigate("/my-bookings");
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary-700">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error || "Tour not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-light py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Book Tour</h1>

          <div className="bg-primary-50 p-4 rounded-xl mb-6">
            <h2 className="text-xl font-semibold text-primary-800">
              {tour.name}
            </h2>
            <p className="text-gray-600">📍 {tour.destination}</p>
            <p className="text-gray-600 mt-2">
              Price: ${tour.price} | Seats available: {tour.available_seats}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Tickets *
              </label>
              <input
                type="number"
                min="1"
                max={tour.available_seats}
                required
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                  errors.tickets ? "border-red-500" : "border-gray-300"
                }`}
                value={tickets}
                onChange={(e) => {
                  const val = Math.min(
                    parseInt(e.target.value) || 0,
                    tour.available_seats,
                  );
                  setTickets(val);
                  if (errors.tickets) setErrors({ tickets: undefined });
                }}
                onBlur={() => validate()}
              />
              {errors.tickets && (
                <p className="text-red-500 text-sm mt-1">{errors.tickets}</p>
              )}
              <p className="text-sm text-gray-400 mt-1">
                Max {tour.available_seats} seats available
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests (optional)
              </label>
              <textarea
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requests..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || tour.available_seats === 0}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition disabled:opacity-50"
              >
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookTour;
