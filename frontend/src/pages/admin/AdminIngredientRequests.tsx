import { useEffect, useState } from "react";
import { ingredientRequestAPI, ingredientAPI } from "../../services/api";

export function AdminIngredientRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await ingredientRequestAPI.getAll(tab);
      setRequests(res.requests || []);
    } catch (err) {
      console.error(err);
      alert("Không tải được yêu cầu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

  const approve = async (request: any) => {
    if (!window.confirm("Duyệt yêu cầu này?")) return;

    try {
      await ingredientRequestAPI.approve(request.request_id, selectedNote[request.request_id] || "");

      await load();
      alert("Đã duyệt và thêm nguyên liệu!");
    } catch (err) {
      console.error(err);
      alert("Duyệt thất bại");
    }
  };

  const reject = async (id: number) => {
    if (!selectedNote[id]) return alert("Vui lòng nhập ghi chú");

    try {
      await ingredientRequestAPI.reject(id, selectedNote[id]);
      await load();
    } catch (err) {
      console.error(err);
      alert("Từ chối thất bại");
    }
  };

  const filtered = requests.filter(r =>
    r.ingredient_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Quản lý yêu cầu nguyên liệu</h1>

      {/* Tabs */}
      <div className="flex space-x-3">
        {["pending", "approved", "rejected"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === t ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            {t === "pending" && "Đang chờ"}
            {t === "approved" && "Đã duyệt"}
            {t === "rejected" && "Đã từ chối"}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        className="border px-4 py-2 rounded w-full"
        placeholder="Tìm nguyên liệu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Đang tải...</p>
      ) : filtered.length === 0 ? (
        <div className="p-4 bg-white rounded shadow text-center">
          Không có yêu cầu
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.request_id} className="bg-white rounded shadow p-4">
              <p className="font-bold">{r.ingredient_name}</p>
              <p className="text-sm text-gray-600">
                Gửi bởi: {r.User?.username} •{" "}
                {new Date(r.created_at).toLocaleString("vi-VN")}
              </p>
              <p className="mt-2">{r.reason}</p>

              {/* Admin note */}
              {tab === "pending" && (
                <>
                  <textarea
                    className="border rounded w-full mt-3 p-2"
                    placeholder="Ghi chú admin..."
                    value={selectedNote[r.request_id] || ""}
                    onChange={(e) =>
                      setSelectedNote((p) => ({
                        ...p,
                        [r.request_id]: e.target.value,
                      }))
                    }
                  />

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => approve(r)}
                      className="bg-green-600 text-white px-3 py-2 rounded w-1/2"
                    >
                      Duyệt & Thêm nguyên liệu
                    </button>

                    <button
                      onClick={() => reject(r.request_id)}
                      className="bg-red-600 text-white px-3 py-2 rounded w-1/2"
                    >
                      Từ chối
                    </button>
                  </div>
                </>
              )}

              {tab !== "pending" && (
                <p className="mt-2 text-gray-700">
                  Trạng thái: <strong>{r.status}</strong>
                  {r.admin_note && ` • Ghi chú: ${r.admin_note}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
