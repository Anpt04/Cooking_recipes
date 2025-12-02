import { useState, useEffect } from "react";
import { Check, Search, X } from "lucide-react";
import { adminRecipeAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

export const AdminPendingRecipes = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    setFiltered(
      recipes.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, recipes]);

  const fetchPending = async () => {
    try {
      const data = await adminRecipeAPI.getPending();
      setRecipes(data.data || []);
    } catch (e) {
      console.error("Failed to load pending recipes:", e);
    }
  };

  const approve = async (id: number) => {
    await adminRecipeAPI.approve(id);
    fetchPending();
  };

  const reject = async () => {
    if (!rejectId) return;
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }

    await adminRecipeAPI.reject(rejectId, rejectReason);
    setRejectId(null);
    setRejectReason("");
    fetchPending();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Công thức chờ duyệt</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        {/* SEARCH */}
        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg mb-6">
          <Search className="text-gray-400" />
          <input
            placeholder="Tìm công thức..."
            className="ml-2 flex-1 bg-transparent outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LIST */}
        {filtered.length ? (
          <div className="space-y-4">
            {filtered.map((r) => (
              <div
                key={r.recipe_id}
                className="flex items-center bg-white border rounded-xl p-4 shadow hover:bg-gray-50 transition cursor-pointer"

                onClick={() => navigate(`/admin/recipes/${r.recipe_id}`)}
              >
                {/* IMAGE */}
                <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden border">
                  {r.image_url ? (
                    <img
                      src={r.image_url}
                      alt={r.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1 px-4">
                  <h3 className="font-bold text-lg">{r.title}</h3>
                  <p className="text-gray-600 mt-1 text-sm">
                    {r.description?.slice(0, 120)}...
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col space-y-2">

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ❗ stop prevent navigation
                      approve(r.recipe_id);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center"
                  >
                    <Check className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ❗ prevent navigation
                      setRejectId(r.recipe_id);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6">
            Không có công thức chờ duyệt
          </p>
        )}
      </div>

      {/* REJECT MODAL */}
      {rejectId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-3">Lý do từ chối</h2>

            <textarea
              rows={4}
              className="w-full border rounded-lg p-2"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do..."
            />

            <div className="flex justify-end space-x-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => {
                  setRejectId(null);
                  setRejectReason("");
                }}
              >
                Hủy
              </button>

              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                onClick={reject}
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
