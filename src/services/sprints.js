import API from './api';

export const getCurrentSprint = async () => {
  const { data } = await API.get('/sprints/current');
  return data;
};

export const getPastSprints = async () => {
  const { data } = await API.get('/sprints');
  return data;
};

export const joinSprint = async (id) => {
  const { data } = await API.post(`/sprints/${id}/join`);
  return data;
};

export const submitSprint = async (id, repo, comment, stack) => {
  const { data } = await API.post(`/sprints/${id}/submit`, { repo, comment, stack });
  return data;
};

export const getSubmissions = async (id) => {
  const { data } = await API.get(`/sprints/${id}/submissions`);
  return data;
};

export const voteSubmission = async (id) => {
  const { data } = await API.put(`/sprints/submissions/${id}/vote`);
  return data;
};

export const getLeaderboard = async () => {
  const { data } = await API.get('/users/leaderboard');
  return data;
};