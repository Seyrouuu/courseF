import React from 'react'
import { UserIcon, CategoryIcon, DescriptionIcon, ClockIcon, LocationIcon, EditIcon, TrashIcon } from './Icons'

const CourseItem = ({ course, onEdit, onDelete }) => {
  // Fonction pour traduire les jours de la semaine
  const getDayLabel = (day) => {
    const days = {
      'MON': 'Lundi',
      'TUE': 'Mardi',
      'WED': 'Mercredi',
      'THU': 'Jeudi',
      'FRI': 'Vendredi',
      'SAT': 'Samedi',
      'SUN': 'Dimanche'
    }
    return days[day] || day
  }

  return (
    <div className="course-item">
      <h3>{course.name}</h3>
      <p>
        <strong><UserIcon size={16} /> Instructeur:</strong> 
        {course.instructor}
      </p>
      <p>
        <strong><CategoryIcon size={16} /> Catégorie:</strong> 
        {course.category || 'Non spécifié'}
      </p>
      <p>
        <strong><DescriptionIcon size={16} /> Description:</strong> 
        {course.description || 'Aucune description'}
      </p>
      
      {course.schedules && course.schedules.length > 0 && (
        <div className="schedules">
          <h4><ClockIcon size={18} /> Emploi du temps:</h4>
          {course.schedules.map(schedule => (
            <div key={schedule.id} className="schedule-item">
              <span>{getDayLabel(schedule.day)} - {schedule.start_time} à {schedule.end_time}</span>
              {schedule.location && (
                <span>
                  <LocationIcon size={14} />
                  {schedule.location}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="course-actions">
        <button onClick={() => onEdit(course)} className="btn-edit">
          <EditIcon size={16} />
          Modifier
        </button>
        <button onClick={() => onDelete(course.id)} className="btn-delete">
          <TrashIcon size={16} />
          Supprimer
        </button>
      </div>
    </div>
  )
}

export default CourseItem