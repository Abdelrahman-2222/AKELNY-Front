export function getAuthHeaders(): { [header: string]: string } {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('⚠️ No token found in localStorage');
    return {};
  }

  // console.log('🟩 Using token for profile fetch:', token);

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

