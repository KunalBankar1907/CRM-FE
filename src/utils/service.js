import { getAllActiveStages } from "./api";

export const fetchStagesValues = async () => {
  try {
    const res = await getAllActiveStages();
    if (res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch status values', error);
    return [];
  }
};
