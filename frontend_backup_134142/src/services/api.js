import axios from 'axios';

// Axios instance pointing to backend API
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Auth
export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { token }
}

// Posts
export async function getPosts(token) {
  const { data } = await api.get('/posts', {
    headers: { ...authHeaders(token) },
  });
  return data;
}

export async function createPost(token, payload) {
  // Accepts either FormData or an object { title, content, file? }
  let body = payload;
  let headers = { ...authHeaders(token) };

  if (!(payload instanceof FormData)) {
    const { title, content, file } = payload || {};
    if (file) {
      body = new FormData();
      if (title) body.append('title', title);
      if (content) body.append('content', content);
      body.append('file', file);
      // Let the browser set proper multipart boundary
    } else {
      body = { title, content };
      headers['Content-Type'] = 'application/json';
    }
  }

  const { data } = await api.post('/posts', body, { headers });
  return data;
}

export async function updatePost(token, id, payload) {
  // Accepts either FormData or an object { title?, content?, file? }
  let body = payload;
  let headers = { ...authHeaders(token) };

  if (!(payload instanceof FormData)) {
    const { title, content, file } = payload || {};
    if (file) {
      body = new FormData();
      if (title != null) body.append('title', title);
      if (content != null) body.append('content', content);
      body.append('file', file);
    } else {
      body = { ...(title != null ? { title } : {}), ...(content != null ? { content } : {}) };
      headers['Content-Type'] = 'application/json';
    }
  }

  const { data } = await api.put(`/posts/${id}`, body, { headers });
  return data;
}

export async function deletePost(token, id) {
  const { data } = await api.delete(`/posts/${id}`, {
    headers: { ...authHeaders(token) },
  });
  return data;
}

export default {
  api,
  login,
  getPosts,
  createPost,
  updatePost,
  deletePost,
};

