import { Navigate, useNavigate } from "react-router";
import { Link } from "react-router";
import api from "../axios/api";
import { useState } from "react";
import { useSession } from "../hooks/useSession";

export default function Register() {
  const { isAuthenticated } = useSession();
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/register", formData);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div
      className="min-h-screen grid grid-cols-1 md:grid-cols-2"
      style={{
        background: "linear-gradient(135deg, #f0fdfa 0%, #e0e7ff 100%)",
      }}
    >
      <div className="flex items-center justify-center p-8 bg-white rounded-r-3xl shadow-2xl">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-blue-700 drop-shadow-lg">
              Create your account
            </h1>
            <p className="mt-2 text-blue-500 font-medium">
              Join many clubs in here!
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Full Name"
                  type="text"
                  name="userName"
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Email"
                  type="email"
                  name="email"
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Password"
                  type="password"
                  name="password"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 text-lg"
            >
              REGISTER
            </button>

            <p className="text-center text-sm text-gray-600">
              You have account?{" "}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-700 font-medium underline"
              >
                Login now
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 p-8 rounded-l-3xl">
        <div className="text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4 drop-shadow-lg">
            Join us!
          </h2>
          <p className="text-lg mb-6">
            Just go through the boring process of creating an account.
          </p>
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
            alt="Register"
            className="rounded-2xl shadow-xl mx-auto w-72 h-48 object-cover"
          />
        </div>
      </div>
    </div>
  );
}
