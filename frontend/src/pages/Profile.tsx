import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/user.api";
import { User, UserUpdate } from "../types/user.type";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred";
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    current_password?: string;
    new_password?: string;
  }>({});

  const [form, setForm] = useState<{
    full_name: string;
    phone: string;
    email: string;
    current_password: string;
    new_password: string;
  }>({
    full_name: "",
    phone: "",
    email: "",
    current_password: "",
    new_password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await userApi.getProfile(token);
        setProfile(data);
        setForm({
          full_name: data.full_name || "",
          phone: data.phone || "",
          email: data.email,
          current_password: "",
          new_password: "",
        });
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setError(msg || "Failed to load profile");
        if (msg.includes("401") || msg.includes("403")) {
          localStorage.removeItem("access_token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }

    if (form.new_password && !form.current_password) {
      newErrors.current_password =
        "Current password is required to set a new password";
    }
    if (form.new_password && form.new_password.length < 8) {
      newErrors.new_password = "New password must be at least 8 characters";
    }
    if (form.current_password && !form.new_password) setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const updateData: UserUpdate = {};
      if (form.full_name !== (profile?.full_name || ""))
        updateData.full_name = form.full_name;
      if (form.phone !== (profile?.phone || "")) updateData.phone = form.phone;
      if (form.email !== profile?.email) updateData.email = form.email;
      if (form.current_password && form.new_password) {
        updateData.current_password = form.current_password;
        updateData.new_password = form.new_password;
      }

      if (Object.keys(updateData).length === 0) {
        setSuccess("No changes to update");
        setSaving(false);
        return;
      }

      const updated = await userApi.updateProfile(token, updateData);
      setProfile(updated);
      setSuccess("Profile updated successfully!");
      setForm({ ...form, current_password: "", new_password: "" });
      setErrors({});
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-light py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-sm text-gray-500 mb-6">
            Manage your personal information
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500"
                  value={profile.username}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Username cannot be changed
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                onBlur={() => validate()}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                      errors.current_password
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    value={form.current_password}
                    onChange={(e) => {
                      setForm({ ...form, current_password: e.target.value });
                      if (errors.current_password)
                        setErrors({ ...errors, current_password: undefined });
                    }}
                    onBlur={() => validate()}
                  />
                  {errors.current_password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.current_password}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                      errors.new_password ? "border-red-500" : "border-gray-300"
                    }`}
                    value={form.new_password}
                    onChange={(e) => {
                      setForm({ ...form, new_password: e.target.value });
                      if (errors.new_password)
                        setErrors({ ...errors, new_password: undefined });
                    }}
                    onBlur={() => validate()}
                    placeholder="Leave blank to keep current password"
                  />
                  {errors.new_password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.new_password}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition shadow-md disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
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

export default Profile;
