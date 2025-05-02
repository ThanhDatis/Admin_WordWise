/**
 * Hàm fetch tùy chỉnh cho Ngrok endpoint
 * Xử lý vấn đề CORS và thêm Ngrok-Skip-Browser-Warning header
 */
export const fetchNgrok = async (endpoint = '/data', options = {}) => {
  const baseUrl = 'https://01c1-115-76-51-29.ngrok-free.app';
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const defaultOptions = {
    method: 'GET',
    mode: 'cors', // Chỉ định rõ là CORS request
    credentials: 'include', // Gửi cookies nếu cần
    headers: {
      'Content-Type': 'application/json',
      'Ngrok-Skip-Browser-Warning': 'true',
      // Bạn có thể thêm token xác thực nếu cần
      // 'Authorization': `Bearer ${token}`
    }
  };

  // Merge options với defaultOptions
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Phân tích response là JSON
    return await response.json();
  } catch (error) {
    console.error('Error fetching from Ngrok:', error);
    throw error;
  }
};

// Ví dụ sử dụng:
// import { fetchNgrok } from './ngrokService';
//
// // GET request
// fetchNgrok('/data')
//   .then(data => console.log(data))
//   .catch(error => console.error(error));
//
// // POST request
// fetchNgrok('/api/submit', {
//   method: 'POST',
//   body: JSON.stringify({ data: 'example' })
// })
//   .then(response => console.log(response))
//   .catch(error => console.error(error)); 