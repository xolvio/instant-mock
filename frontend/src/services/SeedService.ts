import {getApiBaseUrl} from '../config/config';
import {Seed} from '@/models/Seed';
import axios from 'axios';
// TODO types
const API_URL = getApiBaseUrl();

export const getSeeds = async (graphId, variantName, seedGroupId) => {
  console.log('getSeeds func');
  const response = await axios.get(`${API_URL}/api/seeds`, {
    params: {graphId, variantName, seedGroupId},
  });
  const res = response.data;
  console.log(res);
  return res;
};

export const getSeedById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/seeds/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching seed by id: ${error.message}`);
  }
};

export const createSeed = async (seed: Seed) => {
  try {
    const response = await axios.post(`${API_URL}/api/seeds`, seed);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating seed: ${error.message}`);
  }
};

export const updateSeed = async (seedData) => {
  try {
    const response = await axios.patch(`${API_URL}/api/seeds`, seedData);
    return response.data;
  } catch (error) {
    throw new Error(`Error updating seed: ${error.message}`);
  }
};

export const deleteSeed = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/seeds/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error deleting seed: ${error.message}`);
  }
};
