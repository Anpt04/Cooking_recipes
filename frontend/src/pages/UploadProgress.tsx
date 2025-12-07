import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import bg from "../img/progress_bg.png"; 

export default function UploadProgress() {
  const location = useLocation();
  const navigate = useNavigate();
  const { message, progress = 0, recipeId, status } = location.state || {};

  useEffect(() => {
    if (status === "done" && recipeId) {
      setTimeout(() => {
        navigate(`/recipes/${recipeId}`);
      }, 800);
    }
  }, [status, recipeId, navigate]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay mờ để dễ nhìn hơn */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* CARD */}
      <div className="relative bg-white shadow-2xl rounded-2xl p-10 w-full max-w-lg border border-orange-200">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          Đang xử lý công thức...
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-700 text-center mb-6">
          {message || "Đang tải dữ liệu..."}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
          <div
            className="bg-orange-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-center text-xl font-semibold text-gray-900 mt-3">
          {Math.round(progress)}%
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          {/* Back Home */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl text-gray-700 font-medium transition shadow"
          >
            <Home className="w-5 h-5" />
            Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
