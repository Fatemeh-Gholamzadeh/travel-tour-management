import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toursApi } from "../api/tour.api";
import ConfirmModal from "@/components/ConfirmModal";
import { Tour } from "@/types/tour.type";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred";
}

const AdminTours: React.FC = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sort, setSort] = useState<string>("name");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const data = await toursApi.getAll({
        limit,
        page,
        sort,
        is_active: undefined,
      });
      setTours(data.tours);
      setTotalPages(data.total_pages);
      setError("");
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage || "Failed to load tours");
      if (errorMessage.includes("401") || errorMessage.includes("403")) {
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [page, sort]);

  const handleDelete = (id: number, name: string) => {
    setDeleteTarget({ id, name });
    setModalOpen(true);
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toursApi.toggleStatus(id, !currentStatus);
      setTours(
        tours.map((t) =>
          t.id === id ? { ...t, is_active: !currentStatus } : t,
        ),
      );
    } catch (err: unknown) {
      alert(getErrorMessage(err) || "Failed to update tour status");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await toursApi.delete(deleteTarget.id);
      await fetchTours();
      setModalOpen(false);
      setDeleteTarget(null);
    } catch (err: unknown) {
      alert(getErrorMessage(err) || "Failed to delete tour");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary-700 font-medium">Loading tours...</p>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Tours</h1>
          <Link
            to="/admin/tours/new"
            className="px-5 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition shadow-md"
          >
            + Add New Tour
          </Link>
        </div>

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
          <button
            onClick={() => {
              setSort("destination");
              setPage(1);
            }}
            className={`px-4 py-2 text-sm rounded-xl transition ${
              sort === "destination"
                ? "bg-primary-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Destination
          </button>
          <span className="text-sm text-gray-400 self-center ml-auto">
            {tours.length} of {totalPages} pages
          </span>
        </div>

        {tours.length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl">
            <p className="text-gray-500 text-lg">No tours found</p>
            <Link
              to="/admin/tours/new"
              className="text-primary-600 hover:underline"
            >
              Create your first tour
            </Link>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tours.map((tour) => (
                    <tr
                      key={tour.id}
                      className="hover:bg-gray-50/50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {tour.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {tour.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tour.destination}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        ${new Intl.NumberFormat("en-US").format(tour.price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tour.available_seats} / {tour.capacity}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleToggleStatus(tour.id, tour.is_active)
                          }
                          className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                            tour.is_active
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {tour.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/tours/${tour.id}/edit`}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(tour.id, tour.name)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        title="Delete Tour"
        message={`Are you sure you want to delete tour "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setModalOpen(false);
          setDeleteTarget(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminTours;
