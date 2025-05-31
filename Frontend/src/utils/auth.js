export const isAuthenticated = () => {
    const cookies = document.cookie;
    const token = cookies
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  
    return !!token;
  };
  