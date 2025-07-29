import { useState } from "react";
import api from "../axios/api";
import { Link, Navigate, useNavigate } from "react-router";
import { useSession } from "../hooks/useSession";
import Swal from "sweetalert2";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
  const { setToken, isAuthenticated } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const logIn = async (e) => {
    e.preventDefault();
    try {
      const response = (await api.post("/login", formData)).data;

      if (!response.token) {
        Swal.fire({
          title: "Login Failed",
          text: "Invalid email or password.",
          icon: "error",
        });
        return;
      }

      setToken(response.token);
      Swal.fire({
        title: "Success Login",
        text: "",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
      navigate("/");
    } catch (error) {
      Swal.fire({
        title: "Login Failed",
        text: "Invalid email or password.",
        icon: "error",
      });
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.post("/google-login", {
          google_token: tokenResponse.access_token,
        });

        if (response?.data?.token) {
          setToken(response.data.token);
          Swal.fire({
            title: "Success Login",
            text: "Welcome!",
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
          });
          navigate("/");
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Login Failed",
          text: error.response?.data?.message || "Failed to connect to server",
          icon: "error",
        });
      }
    },
    flow: "implicit",
    scope: "email profile",
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div
      className="min-h-screen grid grid-cols-1 md:grid-cols-2"
      style={{
        background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)",
      }}
    >
      <div className="flex items-center justify-center p-8 bg-white rounded-r-3xl shadow-2xl">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-blue-700 drop-shadow-lg">
              Login to your Account
            </h1>
            <p className="mt-2 text-blue-500 font-medium">Welcome back!</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={logIn}>
            <div className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 text-lg"
            >
              LOG IN
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => googleLogin()}
              className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              <span className="text-gray-700 font-medium">
                Continue with Google
              </span>
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-700 font-medium underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 p-8 rounded-l-3xl">
        <div className="text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4 drop-shadow-lg">
            Connect with any device.
          </h2>
          <p className="text-lg mb-6">
            Everything you need is an internet connection.
          </p>
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80"
            alt="Sport"
            className="rounded-2xl shadow-xl mx-auto w-72 h-48 object-cover"
          />
        </div>
      </div>
    </div>
  );
}
