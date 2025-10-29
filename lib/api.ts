// import axios from 'axios'
// import Cookies from 'js-cookie'

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// // Create axios instance
// export const api = axios.create({
//   baseURL: API_BASE_URL,
// })

// // Add token to requests
// api.interceptors.request.use(
//   (config) => {
//     const token = Cookies.get('access_token')
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

// // Handle token expiration
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token expired, redirect to login
//       Cookies.remove('access_token')
//       localStorage.removeItem('user')
//       window.location.href = '/login'
//     }
//     return Promise.reject(error)
//   }
// )

// export default api