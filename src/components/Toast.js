import React, { useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ExclamationIcon, XIcon } from './Icons'

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [onClose, duration])

  const getToastConfig = () => {
    const config = {
      success: {
        icon: CheckCircleIcon,
        bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
        borderColor: 'border-green-400',
        textColor: 'text-white'
      },
      error: {
        icon: XCircleIcon,
        bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
        borderColor: 'border-red-400',
        textColor: 'text-white'
      },
      warning: {
        icon: ExclamationIcon,
        bgColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        borderColor: 'border-yellow-400',
        textColor: 'text-gray-900'
      },
      info: {
        icon: ExclamationIcon,
        bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
        borderColor: 'border-blue-400',
        textColor: 'text-white'
      }
    }
    return config[type] || config.success
  }

  const { icon: Icon, bgColor, borderColor, textColor } = getToastConfig()

  return (
    <div className={`
      toast-item
      ${bgColor}
      ${textColor}
      border ${borderColor}
      shadow-xl
      rounded-lg
      p-4
      min-w-80
      max-w-md
      transform
      animate-toast-in
      flex
      items-center
      gap-3
      backdrop-blur-sm
      bg-opacity-95
    `}>
      <Icon size={24} />
      <div className="flex-1">
        <p className="font-semibold text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="
          flex-shrink-0
          p-1
          rounded-full
          hover:bg-white
          hover:bg-opacity-20
          transition-colors
          duration-200
        "
      >
        <XIcon size={16} />
      </button>
    </div>
  )
}

export default Toast