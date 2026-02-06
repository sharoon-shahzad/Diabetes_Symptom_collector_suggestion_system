

// Settings API
export async function fetchAllSettings() {
  const res = await axiosInstance.get(\/admin/settings\);
  return res.data;
}

export async function fetchSettingsByCategory(category) {
  const res = await axiosInstance.get(\/admin/settings/category/\\);
  return res.data;
}

export async function fetchSettingByKey(key) {
  const res = await axiosInstance.get(\/admin/settings/\\);
  return res.data;
}

export async function updateSetting(key, value) {
  const res = await axiosInstance.put(\/admin/settings/\\, { value });
  return res.data;
}

export async function bulkUpdateSettings(settings) {
  const res = await axiosInstance.put(\/admin/settings\, { settings });
  return res.data;
}
