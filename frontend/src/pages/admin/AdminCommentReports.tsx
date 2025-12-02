import { useState, useEffect } from "react";
import { Search, Check, X } from "lucide-react";
import { rateReportAPI } from "../../services/api";

export const AdminCommentReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [actionId, setActionId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isApprove, setIsApprove] = useState<boolean>(true);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    setFiltered(
      reports.filter((r) =>
        (r.Rate?.comment || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, reports]);

  const fetchReports = async () => {
    try {
      const data = await rateReportAPI.getAll();
      console.log("Report data:", data);
      setReports(data.reports || []);
    } catch (err) {
      console.error("Failed to load reports", err);
    }
  };

  const handleSubmitAction = async () => {
    if (!actionId || adminNote.trim() === "") {
      alert("Vui lòng nhập ghi chú xử lý!");
      return;
    }

    try {
      if (isApprove) {
        await rateReportAPI.approve(actionId, adminNote);
      } else {
        await rateReportAPI.reject(actionId, adminNote);
      }
      alert("✔ Xử lý thành công!");
      setActionId(null);
      setAdminNote("");
      fetchReports();
    } catch (err) {
      console.error("Failed to process report", err);
      alert("❌ Lỗi xử lý báo cáo");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Báo cáo bình luận</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Search */}
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 mb-6">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            className="ml-2 bg-transparent flex-1 outline-none"
            placeholder="Tìm bình luận..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((report) => (
              <div
                key={report.report_id}
                className="border p-4 rounded-lg flex justify-between items-start"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Người báo cáo: {report.reporter?.username}
                  </p>


                  <p className="text-gray-600">
                    Bình luận: {report.rate?.comment || "—"}
                  </p>


                  <p className="text-gray-500 mt-1">
                    Lý do báo cáo: {report.reason}
                  </p>

                  {report.admin_note && (
                    <p className="text-blue-600 mt-1">
                      Admin đã xử lý: {report.admin_note}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setActionId(report.report_id);
                      setIsApprove(true);
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg"
                  >
                    <Check className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      setActionId(report.report_id);
                      setIsApprove(false);
                    }}
                    className="px-3 py-2 bg-yellow-600 text-white rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Không có báo cáo</p>
        )}
      </div>

      {/* Modal xử lý báo cáo */}
      {actionId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-3">
              {isApprove ? "Duyệt báo cáo" : "Từ chối báo cáo"}
            </h2>

            <textarea
              rows={4}
              className="w-full border rounded-lg p-2"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Nhập ghi chú xử lý..."
            />

            <div className="flex justify-end space-x-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => {
                  setActionId(null);
                  setAdminNote("");
                }}
              >
                Hủy
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={handleSubmitAction}
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
