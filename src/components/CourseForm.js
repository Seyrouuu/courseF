import React, { useState, useEffect } from 'react'
import { courseService } from '../services/api'
import { BookIcon, UserIcon, CategoryIcon, DescriptionIcon, CalendarIcon, PlusIcon, TrashIcon } from './Icons'

const CourseForm = ({ course, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    instructor: '',
    category: '',
    description: '',
    schedules: [{ day: 'MON', start_time: '', end_time: '', location: '' }]
  })
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const weekDays = [
    { value: 'MON', label: 'Lundi' },
    { value: 'TUE', label: 'Mardi' },
    { value: 'WED', label: 'Mercredi' },
    { value: 'THU', label: 'Jeudi' },
    { value: 'FRI', label: 'Vendredi' },
    { value: 'SAT', label: 'Samedi' },
    { value: 'SUN', label: 'Dimanche' }
  ]

  // Fonction pour afficher les toasts
  const showToast = (message, type = 'success') => {
    // Vérifier si la fonction showToast existe dans le contexte parent
    if (typeof window.showToast === 'function') {
      window.showToast(message, type)
    } else {
      // Fallback pour le développement
      console.log(`[${type.toUpperCase()}] ${message}`)
    }
  }

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        instructor: course.instructor || '',
        category: course.category || '',
        description: course.description || '',
        schedules: course.schedules && course.schedules.length > 0 
          ? course.schedules.map(schedule => ({
              ...schedule,
              start_time: schedule.start_time || '',
              end_time: schedule.end_time || ''
            }))
          : [{ day: 'MON', start_time: '', end_time: '', location: '' }]
      })
    }
  }, [course])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setSubmitError('')
  }

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = [...formData.schedules]
    updatedSchedules[index][field] = value
    setFormData(prev => ({ ...prev, schedules: updatedSchedules }))
    setSubmitError('')
  }

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, { day: 'MON', start_time: '', end_time: '', location: '' }]
    }))
    showToast('Nouveau créneau horaire ajouté', 'info')
  }

  const removeSchedule = (index) => {
    if (formData.schedules.length > 1) {
      const updatedSchedules = formData.schedules.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, schedules: updatedSchedules }))
      showToast('Créneau horaire supprimé', 'warning')
    } else {
      showToast('Au moins un créneau horaire est requis', 'error')
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast('Le nom du cours est obligatoire', 'error')
      return false
    }
    if (!formData.instructor.trim()) {
      showToast("Le nom de l'instructeur est obligatoire", 'error')
      return false
    }

    // Validation des horaires
    const validSchedules = formData.schedules.filter(
      s => s.start_time && s.end_time
    )

    if (validSchedules.length === 0) {
      showToast('Au moins un créneau horaire valide est requis', 'error')
      return false
    }

    // Validation des heures (fin après début)
    for (const schedule of validSchedules) {
      if (schedule.start_time >= schedule.end_time) {
        showToast("L'heure de fin doit être après l'heure de début", 'error')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)
    
    try {
      // Validation des données
      if (!validateForm()) {
        setIsSubmitting(false)
        return
      }

      // Nettoyer les données
      const cleanedSchedules = formData.schedules.filter(
        s => s.start_time && s.end_time
      )

      const submitData = {
        ...formData,
        schedules: cleanedSchedules.length > 0 ? cleanedSchedules : []
      }

      console.log('Submitting data:', submitData)

      let response
      if (course) {
        response = await courseService.updateCourse(course.id, submitData)
        showToast('Cours mis à jour avec succès!', 'success')
      } else {
        response = await courseService.createCourse(submitData)
        showToast('Cours créé avec succès!', 'success')
      }
      
      console.log('Save successful:', response.data)
      onSave()
      
    } catch (error) {
      console.error('Error saving course:', error)
      
      let errorMessage = 'Erreur inconnue'
      let toastMessage = 'Erreur lors de la sauvegarde du cours'
      
      if (error.response) {
        const serverError = error.response.data
        errorMessage = `Erreur serveur (${error.response.status}): ${JSON.stringify(serverError)}`
        
        // Messages d'erreur plus spécifiques
        if (error.response.status === 400) {
          toastMessage = 'Données invalides. Vérifiez les informations saisies.'
        } else if (error.response.status === 500) {
          toastMessage = 'Erreur interne du serveur. Veuillez réessayer.'
        }
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur'
        toastMessage = 'Connexion au serveur impossible. Vérifiez votre connexion.'
      } else {
        errorMessage = error.message
      }
      
      setSubmitError(errorMessage)
      showToast(toastMessage, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (formData.name || formData.instructor || formData.schedules.some(s => s.start_time || s.end_time)) {
      if (window.confirm('Voulez-vous vraiment annuler ? Les modifications non enregistrées seront perdues.')) {
        onCancel()
        showToast('Modifications annulées', 'warning')
      }
    } else {
      onCancel()
    }
  }

  return (
    <div className="course-form">
      <h2>
        <BookIcon />
        {course ? 'Modifier le cours' : 'Ajouter un nouveau cours'}
      </h2>
      
      {submitError && (
        <div className="error-message">
          <strong>Erreur détaillée:</strong> {submitError}
        </div>
      )}

      <div className="form-info">
        <p>Les champs marqués d'un * sont obligatoires</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            <BookIcon size={16} />
            Nom du cours *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ex: Développement Web Avancé"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>
            <UserIcon size={16} />
            Instructeur *
          </label>
          <input
            type="text"
            name="instructor"
            value={formData.instructor}
            onChange={handleInputChange}
            placeholder="Ex: Dr. Sophie Martin"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>
            <CategoryIcon size={16} />
            Catégorie
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            placeholder="Ex: Informatique, Mathématiques, Physique..."
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>
            <DescriptionIcon size={16} />
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            placeholder="Décrivez le contenu du cours, les objectifs d'apprentissage, les prérequis..."
            disabled={isSubmitting}
          />
        </div>

        <div className="schedules-section">
          <h3>
            <CalendarIcon />
            Emploi du temps *
            <span className="schedule-count">
              ({formData.schedules.filter(s => s.start_time && s.end_time).length} créneau(x) valide(s))
            </span>
          </h3>
          
          <div className="schedules-list">
            {formData.schedules.map((schedule, index) => (
              <div key={index} className="schedule-form">
                <div className="schedule-day">
                  <label>Jour</label>
                  <select
                    value={schedule.day}
                    onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                    disabled={isSubmitting}
                  >
                    {weekDays.map(day => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="schedule-time">
                  <label>Heure de début</label>
                  <input
                    type="time"
                    value={schedule.start_time}
                    onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="schedule-time">
                  <label>Heure de fin</label>
                  <input
                    type="time"
                    value={schedule.end_time}
                    onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="schedule-location">
                  <label>Lieu</label>
                  <input
                    type="text"
                    value={schedule.location}
                    onChange={(e) => handleScheduleChange(index, 'location', e.target.value)}
                    placeholder="Ex: Salle A12, Amphithéâtre B..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="schedule-actions">
                  {formData.schedules.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeSchedule(index)}
                      disabled={isSubmitting}
                      className="btn-remove"
                    >
                      <TrashIcon size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={addSchedule}
            disabled={isSubmitting}
            className="btn-add-schedule"
          >
            <PlusIcon size={16} />
            Ajouter un créneau horaire
          </button>

          <div className="schedule-help">
            <p>💡 Ajoutez tous les créneaux horaires pour ce cours. Au moins un créneau valide est requis.</p>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={isSubmitting ? 'btn-loading' : ''}
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner"></div>
                {course ? 'Mise à jour...' : 'Création...'}
              </>
            ) : (
              course ? 'Mettre à jour le cours' : 'Créer le cours'
            )}
          </button>
          <button 
            type="button" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

export default CourseForm