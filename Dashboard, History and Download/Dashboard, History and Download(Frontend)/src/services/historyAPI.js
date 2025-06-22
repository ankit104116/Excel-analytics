export const fetchHistory = async (token) => {
  const res = await fetch('http://localhost:3000/api/history', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
};