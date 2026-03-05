import API from './api';

export const getCommitments = async (params = {}) => {
  const { data } = await API.get('/commitments', { params });
  return data;
};

export const getMyCommitments = async () => {
  const { data } = await API.get('/commitments/mine');
  return data;
};

export const createCommitment = async (project, description, stack, deadline) => {
  const { data } = await API.post('/commitments', { project, description, stack, deadline });
  return data;
};

export const updateProgress = async (id, progress) => {
  const { data } = await API.put(`/commitments/${id}/progress`, { progress });
  return data;
};

export const voteCommitment = async (id) => {
  const { data } = await API.put(`/commitments/${id}/vote`);
  return data;
};