import {Seed} from '@/models/Seed';
import axios from 'axios';
// TODO types
const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

export const getSeeds = async (graphId, variantName) => {
  try {
    const response = await axios.get(`${API_URL}/seeds`, {
      params: {graphId, variantName},
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching seeds: ${error.message}`);
  }
};

export const getSeedById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/seeds/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching seed by id: ${error.message}`);
  }
};

export const createSeed = async (seed: Seed) => {
  try {
    const response = await axios.post(`${API_URL}/seeds`, seed);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating seed: ${error.message}`);
  }
};

export const updateSeed = async (seedData) => {
  try {
    const response = await axios.patch(`${API_URL}/seeds`, seedData);
    return response.data;
  } catch (error) {
    throw new Error(`Error updating seed: ${error.message}`);
  }
};

export const deleteSeed = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/seeds/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error deleting seed: ${error.message}`);
  }
};
