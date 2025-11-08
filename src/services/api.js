import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api"; // Your backend URL

export const getFloodData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/floods`);
    return response.data;
  } catch (error) {
    console.error("Error fetching flood data:", error);
    return [];
  }
};

// Add more API calls here for alerts, lockers, volunteers, etc.
