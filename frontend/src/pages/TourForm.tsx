import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toursApi } from "../api/tour.api";
import { TourCreate } from "@/types/tour.type";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred";
}

const TourForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<TourCreate>({
    name: "",
    destination: "",
    description: "",
    start_date: "",
    end_date: "",
    price: 0,
    capacity: 0,
    is_active: true,
    image_url: "",
  });

  const [touched, setTouched] = useState<{
    name: boolean;
    destination: boolean;
    description: boolean;
    start_date: boolean;
    end_date: boolean;
    price: boolean;
    capacity: boolean;
  }>({
    name: false,
    destination: false,
    description: false,
    start_date: false,
    end_date: false,
    price: false,
    capacity: false,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    destination?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    price?: string;
    capacity?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      const fetchTour = async () => {
        try {
          const data = await toursApi.getById(parseInt(id));
          setForm({
            name: data.name,
            destination: data.destination,
            description: data.description,
            start_date: data.start_date.split("T")[0],
            end_date: data.end_date.split("T")[0],
            price: data.price,
            capacity: data.capacity,
            is_active: data.is_active,
            image_url: data.image_url || "",
          });
        } catch (err: unknown) {
          setError(getErrorMessage(err) || "Failed to load tour");
        }
      };
      fetchTour();
    }
  }, [id, isEdit]);

  const validateField = (field: keyof typeof form): string | undefined => {
    switch (field) {
      case "name":
        if (!form.name.trim()) return "Tour name is required";
        if (form.name.trim().length < 3)
          return "Tour name must be at least 3 characters";
        break;
      case "destination":
        if (!form.destination.trim()) return "Destination is required";
        if (form.destination.trim().length < 3)
          return "Destination must be at least 3 characters";
        break;
      case "description":
        if (!form.description.trim()) return "Description is required";
        if (form.description.trim().length < 10)
          return "Description must be at least 10 characters";
        break;
      case "start_date":
        if (!form.start_date) return "Start date is required";
        break;
      case "end_date":
        if (!form.end_date) return "End date is required";
        if (
          form.start_date &&
          form.end_date &&
          form.start_date > form.end_date
        ) {
          return "End date must be after start date";
        }
        break;
      case "price":
        if (form.price <= 0) return "Price must be greater than 0";
        break;
      case "capacity":
        if (form.capacity <= 0) return "Capacity must be at least 1";
        break;
      default:
        return undefined;
    }
    return undefined;
  };

  const validateAll = (): boolean => {
    const newErrors: typeof errors = {};
    const nameError = validateField("name");
    const destinationError = validateField("destination");
    const descriptionError = validateField("description");
    const startDateError = validateField("start_date");
    const endDateError = validateField("end_date");
    const priceError = validateField("price");
    const capacityError = validateField("capacity");

    if (nameError) newErrors.name = nameError;
    if (destinationError) newErrors.destination = destinationError;
    if (descriptionError) newErrors.description = descriptionError;
    if (startDateError) newErrors.start_date = startDateError;
    if (endDateError) newErrors.end_date = endDateError;
    if (priceError) newErrors.price = priceError;
    if (capacityError) newErrors.capacity = capacityError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field as keyof typeof form);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (
    field: keyof typeof form,
    value: string | number | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      destination: true,
      description: true,
      start_date: true,
      end_date: true,
      price: true,
      capacity: true,
    });

    if (!validateAll()) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const data = {
        ...form,
        price: parseFloat(form.price.toString()),
        capacity: parseInt(form.capacity.toString()),
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      };

      if (isEdit) {
        await toursApi.update(parseInt(id), data);
      } else {
        await toursApi.create(data);
      }
      navigate("/admin/tours", { replace: true });
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);
      if (errorMsg.toLowerCase().includes("name")) {
        setErrors((prev) => ({ ...prev, name: errorMsg }));
        setTouched((prev) => ({ ...prev, name: true }));
      } else if (errorMsg.toLowerCase().includes("destination")) {
        setErrors((prev) => ({ ...prev, destination: errorMsg }));
        setTouched((prev) => ({ ...prev, destination: true }));
      } else if (errorMsg.toLowerCase().includes("date")) {
        setErrors((prev) => ({
          ...prev,
          start_date: errorMsg,
          end_date: errorMsg,
        }));
        setTouched((prev) => ({ ...prev, start_date: true, end_date: true }));
      } else {
        setError(errorMsg || "Failed to save tour");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-light py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            {isEdit ? "Edit Tour" : "Create New Tour"}
          </h1>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tour Name *
                </label>
                <input
                  type="text"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                    errors.name && touched.name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                />
                {errors.name && touched.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination *
                </label>
                <input
                  type="text"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                    errors.destination && touched.destination
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={form.destination}
                  onChange={(e) => handleChange("destination", e.target.value)}
                  onBlur={() => handleBlur("destination")}
                />
                {errors.destination && touched.destination && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.destination}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                rows={3}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                  errors.description && touched.description
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                onBlur={() => handleBlur("description")}
              />
              {errors.description && touched.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                    errors.start_date && touched.start_date
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={form.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  onBlur={() => handleBlur("start_date")}
                />
                {errors.start_date && touched.start_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.start_date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                    errors.end_date && touched.end_date
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={form.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  onBlur={() => handleBlur("end_date")}
                />
                {errors.end_date && touched.end_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                    errors.price && touched.price
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={form.price}
                  onChange={(e) =>
                    handleChange("price", parseFloat(e.target.value) || 0)
                  }
                  onBlur={() => handleBlur("price")}
                />
                {errors.price && touched.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition ${
                    errors.capacity && touched.capacity
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={form.capacity}
                  onChange={(e) =>
                    handleChange("capacity", parseInt(e.target.value) || 0)
                  }
                  onBlur={() => handleBlur("capacity")}
                />
                {errors.capacity && touched.capacity && (
                  <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                  value={form.is_active ? "active" : "inactive"}
                  onChange={(e) =>
                    handleChange("is_active", e.target.value === "active")
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (optional)
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                value={form.image_url || ""}
                onChange={(e) => handleChange("image_url", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition shadow-md disabled:opacity-50"
              >
                {loading ? "Saving..." : isEdit ? "Update Tour" : "Create Tour"}
              </button>
              <Link
                to="/admin/tours"
                replace
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TourForm;
