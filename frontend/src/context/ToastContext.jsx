import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let _toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++_toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`animate-fade-in flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg border text-sm font-medium cursor-pointer
              ${t.type === 'success' ? 'bg-green-950 border-green-700 text-green-300' : ''}
              ${t.type === 'error'   ? 'bg-red-950 border-red-700 text-red-300' : ''}
              ${t.type === 'warning' ? 'bg-amber-950 border-amber-700 text-amber-300' : ''}
              ${t.type === 'info'    ? 'bg-indigo-950 border-indigo-700 text-indigo-300' : ''}
            `}
            onClick={() => removeToast(t.id)}
          >
            <span className="flex-1">{t.message}</span>
            <button className="opacity-60 hover:opacity-100 text-base leading-none">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
