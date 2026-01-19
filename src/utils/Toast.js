// Global Toast Utility Wrapper around ToastManager
import toastManager from './ToastManager'

class ToastWrapper {
  success(message, duration = 3000) {
    return toastManager.success(message, duration)
  }

  error(message, duration = 4000) {
    return toastManager.error(message, duration)
  }

  warning(message, duration = 3000) {
    return toastManager.warning(message, duration)
  }

  info(message, duration = 3000) {
    return toastManager.info(message, duration)
  }

  apiSuccess(action, entity = 'Item') {
    toastManager.handleApiSuccess(action, entity)
  }
}

const Toast = new ToastWrapper()
export default Toast
