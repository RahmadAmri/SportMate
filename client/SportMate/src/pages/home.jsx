import { useState, useEffect } from "react";
import api from "../axios/api";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLogs,
  addLog,
  updateLog,
  deleteLog,
} from "../features/progressSlice";

export default function Home() {
  const dispatch = useDispatch();
  const { logs, status, error } = useSelector((state) => state.progress);
  const [data, setData] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [formData, setFormData] = useState({
    sport: "",
    duration: "",
    caloriesBurned: "",
    tags: "",
    pricePerSession: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const getData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/prompt");
      setData(
        res?.data?.sport?.sort((a, b) => a?.caloriesBurned - b?.caloriesBurned)
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to load data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getExercises = async () => {
    try {
      const response = await api.get("/api/back-exercises");
      setExercises(response.data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to load exercises. Please try again.",
      });
    }
  };

  useEffect(() => {
    getExercises();
  }, []);

  useEffect(() => {
    dispatch(fetchLogs());
  }, [dispatch]);

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesEquipment =
      selectedEquipment === "all" || exercise.equipment === selectedEquipment;
    return matchesSearch && matchesEquipment;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        duration: parseInt(formData.duration) || 0, // Add default value
        caloriesBurned: parseInt(formData.caloriesBurned) || 0, // Add default value
        pricePerSession: parseInt(formData.pricePerSession) || 0, // Add default value
        UserId: localStorage.getItem("userId") || 1,
        tags: formData.tags || `#${formData.sport.toLowerCase()}`,
      };

      if (isEditing) {
        await dispatch(updateLog({ id: editId, data: payload })).unwrap();
        Swal.fire({
          icon: "success",
          title: "Log Updated",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        await dispatch(addLog(payload)).unwrap();
        Swal.fire({
          icon: "success",
          title: "Log Added",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      // Reset form with empty strings instead of undefined
      setFormData({
        sport: "",
        duration: "",
        caloriesBurned: "",
        tags: "",
        pricePerSession: "",
        description: "",
      });
      setIsEditing(false);
      setEditId(null);

      // Refresh logs after adding/updating
      dispatch(fetchLogs());
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to save log",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "", // Ensure empty string instead of undefined
    }));
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await dispatch(deleteLog(id)).unwrap();
        Swal.fire("Deleted!", "Your log has been deleted.", "success");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to delete",
      });
    }
  };

  return (
    <>
      <Navbar />
      <article
        className="min-h-screen p-6"
        style={{
          background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)",
        }}
      >
        <section className="mb-16">
          {/* Add New Log Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="sport"
                value={formData.sport || ""} // Add default empty string
                onChange={handleInputChange}
                placeholder="Sport"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                name="duration"
                value={formData.duration || ""} // Add default empty string
                onChange={handleInputChange}
                placeholder="Duration (minutes)"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                name="caloriesBurned"
                value={formData.caloriesBurned || ""} // Add default empty string
                onChange={handleInputChange}
                placeholder="Calories Burned"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="Tags"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="pricePerSession"
                value={formData.pricePerSession || ""} // Add default empty string
                onChange={handleInputChange}
                placeholder="Price Per Session"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? "Update Log" : "Add Log"}
            </button>
          </form>

          {/* Loading State */}
          {status === "loading" && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          )}

          {/* Error State */}
          {status === "failed" && (
            <div className="text-red-500 text-center py-4">
              {error?.message || "Something went wrong"}
            </div>
          )}

          {/* Logs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-bold text-blue-600 mb-2">
                  {log.sport}
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>Duration: {log.duration} minutes</p>
                  <p>Calories Burned: {log.caloriesBurned}</p>
                  <p>
                    Price:{" "}
                    {log.pricePerSession?.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    })}
                  </p>
                  <p>Tags: {log.tags}</p>
                  <p className="text-sm">{log.description}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setFormData(log);
                      setIsEditing(true);
                      setEditId(log.id);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Existing AI Section */}
        <section className="mb-16">
          <h1 className="text-4xl font-extrabold text-blue-700 drop-shadow-lg mb-6">
            Your AI-Powered Sports Companion
          </h1>
          <button
            onClick={() => getData()}
            className="bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-white hover:from-blue-700 hover:to-cyan-600 w-fit rounded-xl shadow-lg transition-all duration-200 font-semibold text-lg"
          >
            Generate Sports that burns most calories 🔥
          </button>
          {isLoading ? (
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-xl mt-8">
              <svg
                className="animate-spin h-6 w-6 text-blue-700"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Generating sports...
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-4">
              {data?.map((e) => {
                return (
                  <li
                    key={e.id}
                    className="rounded-2xl border border-blue-200 bg-white p-6 flex flex-col gap-2 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <h6 className="uppercase text-blue-700 font-bold text-lg tracking-wide">
                      {e.sport}
                    </h6>
                    <p className="text-gray-700 font-medium">
                      Burns{" "}
                      <span className="text-orange-500 font-bold">
                        {e.caloriesBurned}
                      </span>{" "}
                      calories every{" "}
                      <span className="font-bold">{e.duration}</span> minutes
                    </p>
                    <p>{e.description}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                      {e.tags}
                    </span>
                    <p className="text-green-700 font-bold text-lg mt-1 mb-2">
                      {e.pricePerSession?.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      })}{" "}
                      <span className="text-sm font-medium text-gray-500">
                        per session
                      </span>
                    </p>
                    <Link
                      target="_blank"
                      to={`https://wa.me/+79179279063?text=Hi, I'm interested in booking personal training sessions for ${e.sport}. Could you please provide more details about the program, schedule, and complete list of pricing? Thank you!`}
                      className="mt-2 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 text-center"
                    >
                      💬 Contact Personal Trainer
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Exercise Library Section */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-700 mb-4">
              Exercise Library
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our collection of exercises to enhance your workout
              routine
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <input
              type="text"
              placeholder="Search exercises..."
              className="w-full max-w-md mx-auto block px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex justify-center gap-4 flex-wrap">
              {["all", "barbell", "dumbbell", "cable", "body weight"].map(
                (equipment) => (
                  <button
                    key={equipment}
                    onClick={() => setSelectedEquipment(equipment)}
                    className={`px-4 py-2 rounded-full transition duration-200 ${
                      selectedEquipment === equipment
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    } shadow-sm`}
                  >
                    {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Exercise Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExercises.map((exercise, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
              >
                {exercise.gifUrl && (
                  <div className="relative h-56 bg-gray-200">
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded-full shadow-md">
                        {exercise.bodyPart}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {exercise.name}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Equipment:</span>{" "}
                      {exercise.equipment}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Target:</span>{" "}
                      {exercise.target}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
