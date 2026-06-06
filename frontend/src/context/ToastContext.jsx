import React, { createContext, useState, useContext, useCallback } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a toast and schedule its removal
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  // Manual remove
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          let typeClasses = "bg-sky-50 border-sky-200 text-sky-800 shadow-sky-100";
          let icon = "ℹ️";

          if (toast.type === "success") {
            typeClasses = "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100";
            icon = "✅";
          } else if (toast.type === "error") {
            typeClasses = "bg-rose-50 border-rose-200 text-rose-800 shadow-rose-100";
            icon = "❌";
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 border rounded-xl shadow-lg animate-slide-in transition-all duration-300 ${typeClasses}`}
            >
              <div className="flex items-center space-x-2.5 text-sm font-medium">
                <span>{icon}</span>
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold font-sans pl-2"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to consume toasts quickly
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
