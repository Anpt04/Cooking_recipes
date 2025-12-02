import { useEffect, useState } from "react";
import { recipeAPI } from "../../services/api";
import { Link } from "react-router-dom";

export function AdminRecipeReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "resolved" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [noteMap, setNoteMap] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await recipeAPI.getReports(tab);
      setReports(res.reports || res.data || []);
    } catch (err) {
      console.error(err);
      alert("Không tải được báo cáo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

 const resolve = async (reportId: number) => {
  try {
    const note = noteMap[reportId] || "";
    await recipeAPI.resolveReport(reportId, note);
    alert("Đã duyệt báo cáo và từ chối công thức!");
    load();
  } catch (err) {
    console.error(err);
    alert("Duyệt thất bại!");
  }
};


  const reject = async (id: number) => {
    if (!noteMap[id] || !noteMap[id].trim())
      return alert("Vui lòng nhập ghi chú!");

    try {
      await recipeAPI.rejectReport(id, noteMap[id]);
      alert("Đã từ chối báo cáo!");
      load();
    } catch (err) {
      console.error(err);
      alert("Từ chối thất bại!");
    }
  };

  const filtered = reports.filter((r) =>
    r.reason.toLowerCase().includes(search.toLowerCase()) ||
    (r.recipe?.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Quản lý báo cáo công thức</h1>

      {/* Tabs */}
      <div className="flex space-x-3">
        {["pending", "resolved", "rejected"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === t ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            {t === "pending" && "Đang chờ"}
            {t === "resolved" && "Đã duyệt"}
            {t === "rejected" && "Đã từ chối"}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        className="border px-4 py-2 rounded w-full"
        placeholder="Tìm báo cáo theo tiêu đề hoặc lý do..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Đang tải...</p>
      ) : filtered.length === 0 ? (
        <div className="p-4 bg-white rounded shadow text-center">
          Không có báo cáo
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.report_id} className="bg-white rounded shadow p-4">
              <Link
                to={`/recipes/${r.recipe_id}`}
                className="font-bold text-lg text-orange-600 hover:underline"
              >
                {r.recipe?.title || "Không rõ"}
              </Link>
              <p className="text-sm text-gray-600">
                Báo cáo bởi: {r.reporter?.username} •{" "}
                {new Date(r.created_at).toLocaleString("vi-VN")}
              </p>

              <p className="mt-2">{r.reason}</p>

              {/* Pending → hiện textarea + button duyệt/từ chối */}
              {tab === "pending" && (
                <>
                  <textarea
                    className="border rounded w-full mt-3 p-2"
                    placeholder="Ghi chú admin..."
                    value={noteMap[r.report_id] || ""}
                    onChange={(e) =>
                      setNoteMap((p) => ({
                        ...p,
                        [r.report_id]: e.target.value,
                      }))
                    }
                  />

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => resolve(r.report_id)}
                      className="bg-green-600 text-white px-3 py-2 rounded w-1/2"
                    >
                      Duyệt
                    </button>

                    <button
                      onClick={() => reject(r.report_id)}
                      className="bg-red-600 text-white px-3 py-2 rounded w-1/2"
                    >
                      Từ chối
                    </button>
                  </div>
                </>
              )}

              {/* Resolved / rejected → chỉ show trạng thái */}
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
