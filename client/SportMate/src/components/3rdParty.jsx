import { useState, useEffect } from "react";
import api from "../axios/api";

export default function Api() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("all");

  const getApi = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/back-exercises");
      setExercises(response.data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getApi();
  }, []);

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesEquipment =
      selectedEquipment === "all" ||
      exercise.equipment === selectedEquipment;
    return matchesSearch && matchesEquipment;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Your Perfect Workout
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our collection of back exercises to build strength and improve
            posture
          </p>
        </div>

        {/* Search and Filter Section */}
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

        {/* Exercise Cards Grid */}
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
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {exercise.name}
                </h2>
                <div className="space-y-3">
                  <p className="flex items-center text-gray-700">
                    <span className="material-icons mr-2">fitness_center</span>
                    <span className="font-medium">Equipment:</span>
                    <span className="ml-2">{exercise.equipment}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <span className="material-icons mr-2">track_changes</span>
                    <span className="font-medium">Target:</span>
                    <span className="ml-2">{exercise.target}</span>
                  </p>
                  <button className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">No exercises found</h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
