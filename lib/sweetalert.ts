import Swal from 'sweetalert2';

// Custom theme colors matching the app
const customClass = {
  popup: 'rounded-lg',
  confirmButton: 'bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded',
  cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded ml-2',
};

// Success alert
export const showSuccess = (message: string, title: string = 'Success!') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'OK',
    customClass,
  });
};

// Error alert
export const showError = (message: string, title: string = 'Error!') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'OK',
    customClass,
  });
};

// Warning alert
export const showWarning = (message: string, title: string = 'Warning!') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'OK',
    customClass,
  });
};

// Info alert
export const showInfo = (message: string, title: string = 'Info') => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'OK',
    customClass,
  });
};

// Confirm dialog
export const showConfirm = (
  message: string,
  title: string = 'Are you sure?',
  confirmButtonText: string = 'Yes',
  cancelButtonText: string = 'Cancel'
) => {
  return Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    customClass,
  });
};

// Delete confirmation
export const showDeleteConfirm = (itemName?: string) => {
  const message = itemName
    ? `Delete "${itemName}"? This action cannot be undone.`
    : 'This action cannot be undone.';

  return Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    customClass,
  });
};

// Loading alert
export const showLoading = (message: string = 'Please wait...') => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close any open alert
export const closeAlert = () => {
  Swal.close();
};

// Toast notification (small notification at top-right)
export const showToast = (
  message: string,
  icon: 'success' | 'error' | 'warning' | 'info' = 'success'
) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon,
    title: message,
  });
};
