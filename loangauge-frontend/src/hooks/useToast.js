import { useState, useCallback } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 5000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message) => addToast({ type: 'success', message }),
    [addToast]
  );

  const error = useCallback(
    (message) => addToast({ type: 'error', message }),
    [addToast]
  );

  const info = useCallback(
    (message) => addToast({ type: 'info', message }),
    [addToast]
  );

  const warning = useCallback(
    (message) => addToast({ type: 'warning', message }),
    [addToast]
  );

  const showToast = useCallback(
    (message, type = 'info') => addToast({ message, type }),
    [addToast]
  );

  return { toasts, addToast, removeToast, success, error, info, warning, showToast };
}
