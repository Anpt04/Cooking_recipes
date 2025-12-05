const API_BASE_URL = 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('token');

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const authAPI = {
  register: async (data: { username: string; email: string; password: string; full_name?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
    
  },
};

export const userAPI = {
  getProfile: async () => {
    
    const token = getAuthToken();
    if (!token) throw new Error("No token found");
      
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("Profile API response:", data);
    return data;
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch user profile");
    }

    return response.json(); // ✅ Trả JSON bình thường
  },

  updateProfile: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: data, // ✅ ở đây data là FormData, 
    });
    return handleResponse(response);
  },
  getById: async (id: number) => {
  const res = await fetch(`${API_BASE_URL}/users/${id}`);
  return handleResponse(res);
}
};

export const categoryAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return handleResponse(response);
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    return handleResponse(response);
  },

  create: async (data: { name: string; description?: string }) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: number, data: { name: string; description?: string }) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const ingredientAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/ingredients`);
    return handleResponse(response);
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`);
    return handleResponse(response);
  },

  create: async (data: { name: string; unit?: string }) => {
    const response = await fetch(`${API_BASE_URL}/ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: number, data: { name: string; unit?: string }) => {
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const recipeAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/recipes`);
    return handleResponse(response);
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
    return handleResponse(response);
  },

  create: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData, 
    });

    return handleResponse(response);
  },

  update: async (id: number, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData, 
    });

    return handleResponse(response);
  },


  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  getApproved: async (page = 1) => {
    const response = await fetch(
      `${API_BASE_URL}/recipes/approved?page=${page}`
    );
    return handleResponse(response);
  },

  getByUserStatus: async (userId: number, status: string) => {
    const response = await fetch(`${API_BASE_URL}/recipes/user/${userId}?status=${status}`,
    {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  report: async (recipeId: number, reason: string) => {
    const res = await fetch(`${API_BASE_URL}/recipes/${recipeId}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  // admin: lấy reports
  getReports: async (status?: string) => {
    const url = status
      ? `${API_BASE_URL}/recipes/admin/reports?status=${status}`
      : `${API_BASE_URL}/recipes/admin/reports`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(res);
  },

  // admin resolve
  resolveReport: async (id: number, note?: string) => {
    const res = await fetch(`${API_BASE_URL}/recipes/admin/reports/${id}/resolve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ admin_note: note || "" }),
    });
    return handleResponse(res);
  },

  // admin reject
  rejectReport: async (id: number, note: string) => {
    const res = await fetch(`${API_BASE_URL}/recipes/admin/reports/${id}/reject`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ admin_note: note }),
    });
    return handleResponse(res);
  },
};

export const recipeStepAPI = {
  getAllByRecipe: async (recipeId: number) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/recipe_step/recipe/${recipeId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return handleResponse(response);
},

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe_step/${id}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  create: async (data: { recipe_id: number; step_number: number; instruction: string }) => {
    const response = await fetch(`${API_BASE_URL}/recipe_step`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },


  update: async (id: number, formData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/recipe_step/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: formData, 
  });
  return handleResponse(response);
},


  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe_step/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  deleteByRecipe: async (recipeId: number) => {
  const response = await fetch(`${API_BASE_URL}/recipe_step/recipe/${recipeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  return handleResponse(response);
},
};

export const recipeImageAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/recipe_images`);
    return handleResponse(response);
  },

  add: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/recipe_images`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  update: async (imageId: number, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/recipe_images/${imageId}`, {
      method: 'PUT',
      body: formData,
    });
    return handleResponse(response);
  },

  delete: async (imageId: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe_images/${imageId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  deleteByRecipe: async (recipeId: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe_images/recipe/${recipeId}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },
};

export const favoriteAPI = {
  getByUser: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/favorites/${userId}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },

  add: async (data: { user_id: number; recipe_id: number }) => {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  remove: async (userId: number, recipeId: number) => {
    const response = await fetch(`${API_BASE_URL}/favorites/${userId}/${recipeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const followAPI = {
  follow: async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/follow/${userId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(res);
  },

  unfollow: async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/follow/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(res);
  },

  getFollowers: async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/follow/${userId}/followers`);
    return handleResponse(res);
  },

  getFollowing: async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/follow/${userId}/following`);
    return handleResponse(res);
  },
  countFollowers: async (userId: number) =>
    handleResponse(await fetch(`${API_BASE_URL}/follow/${userId}/followers/count`)),

  countFollowing: async (userId: number) =>
    handleResponse(await fetch(`${API_BASE_URL}/follow/${userId}/following/count`))
};


export const rateAPI = {
  addOrUpdate: async (data: { user_id: number; recipe_id: number; rating: number; comment?: string }) => {
    const response = await fetch(`${API_BASE_URL}/rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getByRecipe: async (recipeId: number) => {
    const response = await fetch(`${API_BASE_URL}/rates/recipe/${recipeId}`);
    return handleResponse(response);
  },

  delete: async (rateId: number) => {
    const response = await fetch(`${API_BASE_URL}/rates/${rateId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const recipeIngredientAPI = {
  getByRecipe: async (recipeId: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe-ingredients/${recipeId}`);
    return handleResponse(response);
  },

  add: async (data: { recipe_id: number; ingredient_id: number; quantity : string }) => {
    const response = await fetch(`${API_BASE_URL}/recipe-ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (recipe_id: number, ingredient_id: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/recipe-ingredients/${recipe_id}/${ingredient_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (recipe_id: number, ingredient_id: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe-ingredients/${recipe_id}/${ingredient_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(response);
  },
};

export const recipeCategoryAPI = {
  // ➕ Thêm danh mục cho công thức
  add: async (data: { recipe_id: number; category_id: number }) => {
    const response = await fetch(`${API_BASE_URL}/recipe-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // 🔍 Lấy tất cả danh mục của 1 công thức
  getByRecipe: async (recipeId: number) => {
    const response = await fetch(`${API_BASE_URL}/recipe-categories/${recipeId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // ❌ Xóa 1 danh mục khỏi công thức
  delete: async (data: { recipe_id: number; category_id: number }) => {
    const response = await fetch(`${API_BASE_URL}/recipe-categories`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};


export const adminRecipeAPI = {
  // 🟧 Lấy danh sách công thức chờ duyệt
  getPending: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/recipes/pending`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return handleResponse(response);
  },

  // 🟩 Duyệt công thức (approve)
  approve: async (recipeId: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/recipes/${recipeId}/approve`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return handleResponse(response);
  },

  // 🟥 Từ chối công thức (reject)
  reject: async (recipeId: number, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/recipes/${recipeId}/reject`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    });

    return handleResponse(response);
  },
};

export const rateReportAPI = {
  report: async (rateId: number, reason: string) => {
    const res = await fetch(`${API_BASE_URL}/rate/${rateId}/report`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/rate/admin/rate-reports`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    return handleResponse(res);
  },

  approve: async (id: number, note: string) => {
    const res = await fetch(`${API_BASE_URL}/rate/admin/rate-reports/${id}/approve`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ admin_note: note }),
    });
    return handleResponse(res);
  },

  reject: async (id: number, note: string) => {
    const res = await fetch(`${API_BASE_URL}/rate/admin/rate-reports/${id}/reject`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ admin_note: note }),
    });
    return handleResponse(res);
  },
};

export const ingredientRequestAPI = {
  // USER gửi yêu cầu thêm nguyên liệu
  request: async (data: { ingredient_name: string; unit: string; reason?: string }) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/ingredients/request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // ADMIN – lấy danh sách theo status
  getAll: async (status?: string) => {
    const url = status
      ? `${API_BASE_URL}/admin/ingredients/requests?status=${status}`
      : `${API_BASE_URL}/admin/ingredients/requests`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });

    return handleResponse(res);
  },

  approve: async (id: number, note: string) => {
    const res = await fetch(
      `${API_BASE_URL}/admin/ingredients/requests/${id}/approve`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin_note: note }),
      }
    );

    return handleResponse(res);
  },

  reject: async (id: number, note: string) => {
    const res = await fetch(
      `${API_BASE_URL}/admin/ingredients/requests/${id}/reject`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin_note: note }),
      }
    );

    return handleResponse(res);
  },
};

export const userReportAPI = {
  // User gửi báo cáo người dùng khác
  reportUser: async (reportedUserId: number, reason: string) => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/user-reports/${reportedUserId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ reason }),
    });

    return handleResponse(response);
  },

  // Admin lấy danh sách báo cáo
  getAllReports: async (status?: string) => {
    const token = getAuthToken();

    const url = status
      ? `${API_BASE_URL}/user-reports?status=${status}`
      : `${API_BASE_URL}/user-reports`;

    const response = await fetch(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return handleResponse(response);
  },

  // Admin reject báo cáo
  rejectReport: async (reportId: number, admin_note: string) => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/user-reports/${reportId}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ admin_note }),
    });

    return handleResponse(response);
  },

  // Admin resolve + xử lý user (cảnh cáo, khóa,...)
  resolveReport: async (
    reportId: number,
    admin_note: string,
    action: "warn" | "ban"
  ) => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/user-reports/${reportId}/resolve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ admin_note, action }),
    });

    return handleResponse(response);
  },
};

export const mealPlanAPI = {
  // Lấy tất cả meal plan của user
  getAll: async () => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/meal-plans`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return handleResponse(res);
  },

  // Lấy chi tiết 1 mealplan bằng ID
  getById: async (id: number | string) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/meal-plans/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return handleResponse(res);
  },

  // Tạo meal plan
  create: async (data: any) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/meal-plans`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Gợi ý meal plan
  // suggest: async (data: any) => {
  //   const token = getAuthToken();
  //   const res = await fetch(`${API_BASE_URL}/meal-plans/suggest`, {
  //     method: "POST",
  //     headers: {
  //       Authorization: token ? `Bearer ${token}` : "",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   });
  //   return handleResponse(res);
  // },

  // Cập nhật meal plan
  update: async (id: number | string, data: any) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/meal-plans/${id}`, {
      method: "PUT",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

    delete: async (id: string | number) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/meal-plans/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return handleResponse(res);
  },

  // Thêm recipe vào meal plan
  addRecipe: async (id: number | string, recipeData: any) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/meal-plans/${id}/recipes`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipeData),
    });
    return handleResponse(res);
  },

  // Xóa 1 recipe theo recipe_id
  removeRecipe: async (mealplan_id: number | string, recipe_id: number) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/meal-plans/${mealplan_id}/recipes/${recipe_id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return handleResponse(res);
  },

  // Xóa recipe theo composite key (meal_type + date + recipe_id)
  removeRecipeFull: async (id: number | string, body: any) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/meal-plans/${id}/recipes`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  // Lấy danh sách recipe theo meal plan
  getRecipes: async (id: number | string) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/mealplans/${id}/recipes`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return handleResponse(res);
  },
};

export const shoppingListAPI = {
  // Lấy danh sách shopping list theo mealplan
  get: async (mealplan_id: string | number) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/shopping-list/${mealplan_id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return handleResponse(res);
  },

  // Thêm item vào shopping list
  add: async (data: any) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/shopping-list`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Toggle check/uncheck item
  toggle: async (item_id: string | number) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/shopping-list/toggle/${item_id}`, {
      method: "PATCH",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return handleResponse(res);
  },

  // Xóa item khỏi shopping list
  delete: async (item_id: string | number) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/shopping-list/${item_id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return handleResponse(res);
  },

  // Tự động generate shopping list theo mealplan
  generate: async (mealplan_id: string | number) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/shopping-list/generate/${mealplan_id}`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return handleResponse(res);
  },
};

