import { useNavigate } from "react-router";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md rounded-b-2xl mb-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-extrabold text-blue-700 tracking-tight">
          SportMate
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all duration-200"
      >
        Logout
      </button>
    </nav>
  );
}
