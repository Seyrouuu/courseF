import React, { useState, useEffect } from 'react'
import CourseList from './components/CourseList'
import CourseForm from './components/CourseForm'
import ToastContainer from './components/ToastContainer'
import { BookIcon, SunIcon, MoonIcon, PlusIcon } from './components/Icons'
import './App.css'

function App() {
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const [darkMode, setDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [toasts, setToasts] = useState([])

  // Charger le thème depuis le localStorage et les préférences système
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme))
    } else {
      setDarkMode(systemPrefersDark)
    }
    
    setIsLoading(false)
  }, [])

  // Appliquer le thème au document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Fonction pour ajouter un toast
  const showToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    const newToast = { id, message, type, duration }
    
    setToasts(prevToasts => [...prevToasts, newToast])
  }

  // Fonction pour supprimer un toast
  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    showToast(
      darkMode ? 'Mode clair activé' : 'Mode sombre activé', 
      'info', 
      3000
    )
  }

  const handleAddCourse = () => {
    setEditingCourse(null)
    setShowForm(true)
  }

  const handleEditCourse = (course) => {
    setEditingCourse(course)
    setShowForm(true)
  }

  const handleSaveCourse = () => {
    setShowForm(false)
    setEditingCourse(null)
    setRefresh(prev => prev + 1)
    
    // Notification de succès
    showToast(
      editingCourse ? 'Cours mis à jour avec succès!' : 'Cours créé avec succès!', 
      'success'
    )
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCourse(null)
  }

  // Fonction pour gérer la suppression depuis CourseList
  const handleCourseDeleted = () => {
    showToast('Cours supprimé avec succès!', 'success')
  }

  if (isLoading) {
    return (
      <div className="loading">
        <div>Chargement...</div>
      </div>
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <BookIcon size={36} color="white" />
          Système de Gestion des Cours
        </h1>
        <button 
          className="theme-toggle"
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
          title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {darkMode ? <SunIcon size={20} color="white" /> : <MoonIcon size={20} color="white" />}
        </button>
      </header>

      <main className="App-main">
        {showForm ? (
          <CourseForm
            course={editingCourse}
            onSave={handleSaveCourse}
            onCancel={handleCancel}
          />
        ) : (
          <>
            <div className="header-actions">
              <button onClick={handleAddCourse} className="btn-primary">
                <PlusIcon size={18} />
                Ajouter un nouveau cours
              </button>
              <div className="badge badge-primary">
                {darkMode ? '🌙 Mode sombre' : '☀️ Mode clair'}
              </div>
            </div>
            <CourseList 
              onEdit={handleEditCourse}
              refresh={refresh}
              onCourseDeleted={handleCourseDeleted}
            />
          </>
        )}
      </main>

      {/* Container des toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default App