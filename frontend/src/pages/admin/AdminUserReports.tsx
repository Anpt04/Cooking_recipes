import { useState, useEffect } from "react";
import { Search, Check, X } from "lucide-react";
import { userReportAPI } from "../../services/api";

export const AdminUserReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [action, setAction] = useState<"warn" | "ban">("warn");

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    setFiltered(
      reports.filter((r) =>
        r.reportedUser?.username?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, reports]);

  const fetchReports = async () => {
    const data = await userReportAPI.getAllReports();
    setReports(data.reports || []);
    console.log(data);
  };

  // Mở modal resolve
  const openResolveModal = (reportId: number) => {
    setSelectedId(reportId);
    setAdminNote("");
    setAction("warn");
    setShowResolveModal(true);
  };

  // Gửi resolve API
  const confirmResolve = async () => {
    if (!selectedId) return;

    await userReportAPI.resolveReport(
      selectedId,
      adminNote,
      action
    );

    setShowResolveModal(false);
    fetchReports();
  };

  // Mở modal reject
  const openRejectModal = (reportId: number) => {
    setSelectedId(reportId);
    setAdminNote("");
    setShowRejectModal(true);
  };

  // Gửi reject API
  const confirmReject = async () => {
    if (!selectedId) return;

    await userReportAPI.rejectReport(selectedId, adminNote);

    setShowRejectModal(false);
    fetchReports();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Báo cáo người dùng</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        {/* Search */}
        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg mb-6">
          <Search className="text-gray-400 h-5 w-5" />
          <input
            placeholder="Tìm người dùng..."
            className="ml-2 flex-1 bg-transparent outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((r) => (
              <div
                key={r.report_id}
                className="p-4 rounded-lg border flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{r.reportedUser?.username}</p>
                  <p className="text-gray-500">Lý do: {r.reason}</p>
                  <p className="text-gray-400 text-sm">
                    Người báo cáo: {r.reporter?.username}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openResolveModal(r.report_id)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Check className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => openRejectModal(r.report_id)}
                    className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">Không có báo cáo</p>
        )}
      </div>

      {/* ---------------------- MODAL RESOLVE ---------------------- */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-xl font-semibold">Xử lý báo cáo</h2>

            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Nhập ghi chú..."
              className="w-full p-3 border rounded-lg"
            />

            <div>
              <label className="block font-medium mb-1">Hành động:</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full border p-2 rounded-lg"
              >
                <option value="warn">Cảnh cáo (Warn)</option>
                <option value="ban">Cấm (Ban)</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={confirmResolve}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------- MODAL REJECT ---------------------- */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-xl font-semibold">Từ chối báo cáo</h2>

            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Nhập lý do..."
              className="w-full p-3 border rounded-lg"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
