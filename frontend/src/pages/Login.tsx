import React, { useState, useEffect } from "react";
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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [form, setForm] = useState({ username: "", password: "" });
  const [touched, setTouched] = useState<{
    username: boolean;
    password: boolean;
  }>({
    username: false,
    password: false,
  });
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateField = (field: keyof typeof form): string | undefined => {
    if (field === "username") {
      if (!form.username.trim()) return "Username is required";
      if (form.username.trim().length < 3)
        return "Username must be at least 3 characters";
    }
    if (field === "password") {
      if (!form.password) return "Password is required";
      if (form.password.length < 8)
        return "Password must be at least 8 characters";
    }
    return undefined;
  };

  const validateAll = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};
    const usernameError = validateField("username");
    const passwordError = validateField("password");
    if (usernameError) newErrors.username = usernameError;
    if (passwordError) newErrors.password = passwordError;
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
    if (touched[field]) {
      const error = validateField(field);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    if (!validateAll()) return;

    setLoading(true);
    setApiError("");
    setErrors({});

    try {
      const response = await authApi.login(form);
      setAuth(response.access_token, response.user);
      localStorage.setItem("access_token", response.access_token);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const errorMsg = extractApiError(err);

      if (errorMsg.includes("Username not found")) {
        setErrors({ username: errorMsg });
        setTouched((prev) => ({ ...prev, username: true }));
      } else if (errorMsg.includes("Incorrect password")) {
        setErrors({ password: errorMsg });
        setTouched((prev) => ({ ...prev, password: true }));
      } else {
        setApiError(
          errorMsg || "Invalid username or password. Please try again.",
        );
        setErrors({
          username: " ",
          password: " ",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-light">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-96">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Login to your account
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
              placeholder="Username"
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
              type="password"
              placeholder="Password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary-600 font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
