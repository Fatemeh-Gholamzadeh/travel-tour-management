import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import axios from "axios";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred";
}

function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "detail" in data) {
      return String(data.detail);
    }
    return error.message;
  }
  return getErrorMessage(error);
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
  });
  const [touched, setTouched] = useState<{
    username: boolean;
    email: boolean;
    password: boolean;
    full_name: boolean;
  }>({
    username: false,
    email: false,
    password: false,
    full_name: false,
  });
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    full_name?: string;
  }>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateField = (field: keyof typeof form): string | undefined => {
    switch (field) {
      case "username":
        if (!form.username.trim()) return "Username is required";
        if (form.username.trim().length < 3)
          return "Username must be at least 3 characters";
        break;
      case "email":
        if (!form.email.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(form.email)) return "Email is invalid";
        break;
      case "password":
        if (!form.password) return "Password is required";
        if (form.password.length < 8)
          return "Password must be at least 8 characters";
        break;
      case "full_name":
        if (form.full_name.trim() && form.full_name.trim().length < 3) {
          return "Full name must be at least 3 characters";
        }
        break;
      default:
        return undefined;
    }
    return undefined;
  };

  const validateAll = (): boolean => {
    const newErrors: typeof errors = {};
    const usernameError = validateField("username");
    const emailError = validateField("email");
    const passwordError = validateField("password");
    const fullNameError = validateField("full_name");
    if (usernameError) newErrors.username = usernameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (fullNameError) newErrors.full_name = fullNameError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: keyof typeof form) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      username: true,
      email: true,
      password: true,
      full_name: true,
    });

    if (!validateAll()) return;

    setLoading(true);
    setApiError("");
    setErrors({});

    try {
      const response = await authApi.register(form);
      setAuth(response.access_token, response.user);
      localStorage.setItem("access_token", response.access_token);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const errorMsg = extractApiError(err);
      if (
        errorMsg.toLowerCase().includes("username") ||
        errorMsg.toLowerCase().includes("already registered")
      ) {
        setErrors({ username: errorMsg });
        setTouched((prev) => ({ ...prev, username: true }));
      } else if (
        errorMsg.toLowerCase().includes("email") &&
        errorMsg.toLowerCase().includes("already")
      ) {
        setErrors({ email: errorMsg });
        setTouched((prev) => ({ ...prev, email: true }));
      } else {
        setApiError(errorMsg || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-light py-8">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Join us and start exploring
        </p>

        {apiError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <input
              type="text"
              placeholder="Username *"
              autoComplete="off"
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                errors.username && touched.username
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              defaultValue=""
              onChange={(e) => handleChange("username", e.target.value)}
              onBlur={() => handleBlur("username")}
            />
            {errors.username && touched.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email *"
              autoComplete="off"
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                errors.email && touched.email
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              defaultValue=""
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password *"
              autoComplete="new-password"
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                errors.password && touched.password
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              defaultValue=""
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
            />
            {errors.password && touched.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Full Name"
              autoComplete="off"
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                errors.full_name && touched.full_name
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              defaultValue=""
              onChange={(e) => handleChange("full_name", e.target.value)}
              onBlur={() => handleBlur("full_name")}
            />
            {errors.full_name && touched.full_name && (
              <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
            )}
          </div>

          <input
            type="text"
            placeholder="Phone Number"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
            defaultValue=""
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
