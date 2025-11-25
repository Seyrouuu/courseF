import React, { useState, useEffect, useCallback } from 'react'
import { courseService } from '../services/api'
import CourseItem from './CourseItem'
import { SearchIcon, FilterIcon } from './Icons'

const CourseList = ({ onEdit, refresh, onCourseDeleted }) => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    instructor: ''
  })

  const fetchCourses = useCallback(async (searchParams = {}) => {
    try {
      setLoading(true)
      const response = await courseService.getCourses(searchParams)
      setCourses(response.data)
      setError('')
    } catch (err) {
      setError('Échec du chargement des cours')
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses, refresh])

  const handleDelete = async (courseId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await courseService.deleteCourse(courseId)
        fetchCourses()
        // Appeler la fonction de callback pour le toast
        if (onCourseDeleted) {
          onCourseDeleted()
        }
      } catch (err) {
        setError('Échec de la suppression du cours')
        console.error('Error deleting course:', err)
      }
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    
    const searchParams = {}
    if (filters.search) searchParams.search = filters.search
    if (filters.category) searchParams.category = filters.category
    if (filters.instructor) searchParams.instructor = filters.instructor
    
    fetchCourses(searchParams)
  }

  const handleResetFilters = () => {
    setFilters({ search: '', category: '', instructor: '' })
    fetchCourses()
  }

  if (loading) return (
    <div className="loading">
      <div>Chargement en cours...</div>
    </div>
  )
  
  if (error) return (
    <div className="error">
      <div>{error}</div>
    </div>
  )

  return (
    <div className="course-list">
      <div className="filters">
        <h2>
          <FilterIcon />
          Filtrer les cours
        </h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            name="search"
            placeholder="Rechercher dans les cours..."
            value={filters.search}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="category"
            placeholder="Catégorie"
            value={filters.category}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="instructor"
            placeholder="Instructeur"
            value={filters.instructor}
            onChange={handleFilterChange}
          />
          <button type="submit">
            <SearchIcon size={16} />
            Rechercher
          </button>
          <button type="button" onClick={handleResetFilters}>
            Réinitialiser
          </button>
        </form>
      </div>

      <h2>Liste des cours ({courses.length})</h2>
      
      {courses.length === 0 ? (
        <p>Aucun cours disponible</p>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <CourseItem
              key={course.id}
              course={course}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CourseList