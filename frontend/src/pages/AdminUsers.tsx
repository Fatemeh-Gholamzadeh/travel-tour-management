import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/user.api";
import ConfirmModal from "@/components/ConfirmModal";
import { User } from "../types/user.type";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred";
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await userApi.getAllUsers(token);
        setUsers(data);
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setError(msg || "Failed to load users");
        if (msg.includes("403") || msg.includes("401")) {
          localStorage.removeItem("access_token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleRoleToggle = async (userId: number, currentRole: boolean) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setUpdating(userId);
    try {
      const updated = await userApi.changeUserRole(token, userId, !currentRole);
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
    } catch (err: unknown) {
      alert(getErrorMessage(err) || "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = (userId: number, userName: string) => {
    setDeleteTarget({ id: userId, name: userName });
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      await userApi.deleteUser(token, deleteTarget.id);
      setUsers(users.filter((u) => u.id !== deleteTarget.id));
      setModalOpen(false);
      setDeleteTarget(null);
    } catch (err: unknown) {
      alert(getErrorMessage(err) || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary-700">Loading users...</p>
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
          User Management
        </h1>

        {users.length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl">
            <p className="text-gray-500 text-lg">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {user.id}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.full_name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${user.is_admin ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {user.is_admin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleRoleToggle(user.id, user.is_admin)
                          }
                          disabled={updating === user.id}
                          className={`px-3 py-1 text-xs rounded-lg transition ${
                            user.is_admin
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              : "bg-primary-100 text-primary-700 hover:bg-primary-200"
                          }`}
                        >
                          {updating === user.id
                            ? "..."
                            : user.is_admin
                              ? "Remove Admin"
                              : "Make Admin"}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-xs"
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
        )}
      </div>
      <ConfirmModal
        isOpen={modalOpen}
        title="Delete User"
        message={`Are you sure you want to delete user "${deleteTarget?.name}"? This will also delete all their bookings.`}
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

export default AdminUsers;
