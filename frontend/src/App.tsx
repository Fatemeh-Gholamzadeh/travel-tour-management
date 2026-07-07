import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AdminTours from "./pages/AdminTours";
import TourForm from "./pages/TourForm";
import BookTour from "./pages/BookTour";
import MyBookings from "./pages/MyBookings";
import AdminBookings from "./pages/AdminBookings";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import { authApi } from "./api/auth.api";

function App() {
  const { isAuthenticated, setAuth, setLoading, isLoading } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token && !isAuthenticated) {
        setLoading(true);
        try {
          const user = await authApi.getCurrentUser();
          setAuth(token, user);
        } catch (error) {
          console.error("Auth initialization error:", error);
          localStorage.removeItem("access_token");
        } finally {
          setLoading(false);
        }
      }
      setInitialized(true);
    };

    initAuth();
  }, [isAuthenticated, setAuth, setLoading]);

  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-light">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:id"
          element={
            <ProtectedRoute>
              <BookTour />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tours"
          element={
            <ProtectedRoute requireAdmin>
              <AdminTours />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tours/new"
          element={
            <ProtectedRoute requireAdmin>
              <TourForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tours/:id/edit"
          element={
            <ProtectedRoute requireAdmin>
              <TourForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute requireAdmin>
              <AdminBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
