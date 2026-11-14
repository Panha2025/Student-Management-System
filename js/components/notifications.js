export function createNotifications(container) {
  return function notify(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    notification.textContent = message;
    container.append(notification);
    setTimeout(() => notification.remove(), type === 'error' ? 8000 : 4000);
  };
}
