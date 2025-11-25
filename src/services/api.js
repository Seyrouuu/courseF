import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes timeout
})

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    
    if (error.response) {
      // Le serveur a répondu avec un statut d'erreur
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('No response received:', error.request)
    } else {
      // Quelque chose s'est mal passé lors de la configuration de la requête
      console.error('Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export const courseService = {
  getCourses: (params = {}) => api.get('/courses/', { params }),
  getCourse: (id) => api.get(`/courses/${id}/`),
  createCourse: (courseData) => api.post('/courses/', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}/`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}/`)
}

export default api