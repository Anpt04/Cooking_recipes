import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link, useParams } from "react-router-dom";
import { User, Mail, Edit2, Save, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { userAPI, recipeAPI, followAPI, userReportAPI } from "../services/api";
import bg from "../img/home_background.jpeg"
import head_bg from "../img/1_bg_head.png"
const BACKGROUND = bg;
const HEAD_BG = head_bg;

type FollowUser = {
  user_id: number;
  username: string;
  avatar_url?: string;
};

export const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const profileId = Number(id);

  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const [user, setUser] = useState<any>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isOwner = currentUser?.user_id === profileId;

  // Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // Filter recipes
  const [filter, setFilter] =
    useState<"approved" | "pending" | "rejected">("approved");

  const [formData, setFormData] = useState({
    username: "",
    avatar_url: "",
    avatarFile: null as File | null,
  });

  // LOAD PROFILE
  useEffect(() => {
    if (!profileId) return;
    const loadProfile = async () => {
      const res = await userAPI.getById(profileId);
      setUser(res.user);
      setFormData({
        username: res.user.username,
        avatar_url: res.user.avatar_url,
        avatarFile: null,
      });
      setPreview(res.user.avatar_url);
    };

    loadProfile();
    fetchUserRecipes("approved");
  }, [profileId]);

  // Check follow
  useEffect(() => {
    if (!profileId || !currentUser) return;
    followAPI.getFollowing(currentUser.user_id).then((res) => {
      const followingList = res.data || [];
      setIsFollowing(
        followingList.some((u: any) => u.following?.user_id === profileId)
      );
    });
  }, [profileId, currentUser]);

  // Count follow
  useEffect(() => {
    if (!profileId) return;
    followAPI.countFollowers(profileId).then((res) => setFollowerCount(res.count));
    followAPI.countFollowing(profileId).then((res) => setFollowingCount(res.count));
  }, [profileId]);

  // Load recipes
  const fetchUserRecipes = async (status: string) => {
    try {
      const res = await recipeAPI.getByUserStatus(profileId, status);
      setRecipes(res.data || []);
    } catch (err) {
      console.error("Failed to load recipes:", err);
    }
  };

  const handleFilterChange = (newFilter: "approved" | "pending" | "rejected") => {
    setFilter(newFilter);
    fetchUserRecipes(newFilter);
  };

  // FOLLOW
  const toggleFollow = async () => {
    if (!currentUser) {
      toast.error("Bạn cần đăng nhập!");
      return;
    }

    if (isFollowing) {
      await followAPI.unfollow(profileId);
      setIsFollowing(false);
    } else {
      await followAPI.follow(profileId);
      setIsFollowing(true);
    }
  };

  // UPDATE PROFILE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatarFile: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("username", formData.username);
      if (formData.avatarFile) form.append("avatar", formData.avatarFile);

      const updated = await userAPI.updateProfile(form);
      setCurrentUser((prev) => ({ ...prev, ...updated.user }));

      setIsEditing(false);
      toast.success("Cập nhật hồ sơ thành công!");

    } catch (err) {
      toast.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${BACKGROUND})` }}
    >
      {/* LAYER MỜ */}
      <div className="min-h-screen bg-white/70 backdrop-blur-sm pb-12 relative z-10">

        {/* HEADER */}
        <div className="relative h-52 bg-cover bg-center rounded-b-3xl shadow-md"
          style={{ backgroundImage: `url(${HEAD_BG})` }}
        >
          <div className="absolute inset-0 bg-black/40 rounded-b-3xl"></div>
        </div>

        {/* CONTAINER */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 relative z-20">

          {/* PROFILE CARD */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-8">

              {/* Avatar */}
              <div className="relative flex-shrink-0 mx-auto md:mx-0">
                {preview ? (
                  <img
                    src={preview}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-orange-100 flex items-center justify-center shadow-lg">
                    <User className="h-16 w-16 text-orange-500" />
                  </div>
                )}

                {isOwner && isEditing && (
                  <label className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-white text-sm py-1 rounded-b-full cursor-pointer">
                    Chọn ảnh
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>

              {/* INFO */}
              <div className="flex-1 mt-6 md:mt-0">
                {!isEditing ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h1 className="text-3xl font-bold">{user.username}</h1>

                      {!isOwner && (
                        <div className="flex space-x-3">
                          <button
                            onClick={toggleFollow}
                            className={`px-5 py-2 rounded-lg font-medium text-white shadow-md ${
                              isFollowing ? "bg-red-500" : "bg-orange-500"
                            }`}
                          >
                            {isFollowing ? "Hủy theo dõi" : "Theo dõi"}
                          </button>

                          <button
                            onClick={() => setShowReportModal(true)}
                            className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium shadow-md hover:bg-red-700"
                          >
                            Báo cáo
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600">@{user.username}</p>

                    <div className="mt-3 flex items-center space-x-2 text-gray-600">
                      <Mail className="h-5 w-5" /> {user.email}
                    </div>

                    {isOwner && (
                      <button
                        className="mt-4 px-4 py-2 border rounded-lg text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="h-4 w-4 inline-block mr-2" />
                        Chỉnh sửa hồ sơ
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      className="w-full px-4 py-2 border rounded-lg mb-3"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />

                    <div className="flex space-x-3">
                      <button
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center space-x-2"
                        onClick={handleUpdate}
                      >
                        <Save className="h-4 w-4" /> <span>Lưu</span>
                      </button>

                      <button
                        className="px-4 py-2 border rounded-lg"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}

                {/* Follower */}
                <div className="flex space-x-10 mt-6">
                  <Link to={`/profile/${profileId}/followers`}>
                    <p className="text-xl font-bold">{followerCount}</p>
                    <p className="text-gray-500 text-sm">Người theo dõi</p>
                  </Link>

                  <Link to={`/profile/${profileId}/following`}>
                    <p className="text-xl font-bold">{followingCount}</p>
                    <p className="text-gray-500 text-sm">Đang theo dõi</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* REPORT MODAL */}
          {showReportModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl animate-scaleIn">
                <h2 className="text-xl font-bold mb-4">Báo cáo người dùng</h2>
                <p className="text-gray-600 text-sm mb-3">
                  Vui lòng mô tả lý do bạn muốn báo cáo người dùng này.
                </p>

                <textarea
                  rows={4}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Nhập lý do..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />

                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    onClick={() => {
                      setShowReportModal(false);
                      setReportReason("");
                    }}
                  >
                    Hủy
                  </button>

                  <button
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                    onClick={async () => {
                      if (reportReason.trim() === "") {
                        toast.error("Bạn phải nhập lý do!");
                        return;
                      }

                      try {
                        await userReportAPI.reportUser(profileId, reportReason);
                        toast.success("Gửi báo cáo thành công!");
                        setShowReportModal(false);
                        setReportReason("");
                      } catch (error) {
                        console.error(error);
                        toast.error("Không thể gửi báo cáo!");
                      }
                    }}
                  >
                    Gửi báo cáo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FILTER BUTTONS */}
          <div className="flex space-x-4 my-6">
            {(["approved", "pending", "rejected"] as const).map((type) => (
              <button
                key={type}
                className={`px-4 py-2 rounded-lg capitalize shadow ${
                  filter === type
                    ? "bg-orange-500 text-white"
                    : "bg-white border hover:bg-gray-100"
                }`}
                onClick={() => handleFilterChange(type)}
              >
                {type === "approved"
                  ? "Đã duyệt"
                  : type === "pending"
                  ? "Chờ duyệt"
                  : "Bị từ chối"}
              </button>
            ))}
          </div>

          {/* LIST RECIPES */}
          <h2 className="text-2xl font-bold mb-4">Công thức của người dùng</h2>

          {recipes.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">
              Không có công thức nào.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((r) => (
                <Link
                  key={r.recipe_id}
                  to={`/recipes/${r.recipe_id}`}
                  className="bg-white rounded-xl shadow group hover:shadow-xl transition overflow-hidden"
                >
                  <div className="h-48 bg-gray-100">
                    <img
                      src={r.image_url}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      alt={r.title}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold">{r.title}</h3>
                    <p className="text-gray-600 line-clamp-2">{r.description}</p>

                    {r.status === "rejected" && (
                      <p className="mt-2 text-red-600 text-sm">
                        Lý do từ chối: {r.reject_reason}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
