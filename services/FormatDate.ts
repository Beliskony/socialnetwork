export function formatRelativeDate(dateString?: string): string {
  if (!dateString || typeof dateString !== 'string') {
    return 'Date inconnue';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return `il y'a ${seconds} sec`;
    } else if (minutes < 60) {
      return `il y'a ${minutes} min`;
    } else if (hours < 24) {
      return `il y'a ${hours}h`;
    } else if (days < 7) {
      return `il y'a ${days}j`;
    } else {
      // Afficher sous forme jj/mm/aa
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yy = String(date.getFullYear()).slice(-2);
      return `${dd}/${mm}/${yy}`;
    }

  } catch (error) {
    console.error('Erreur formatRelativeDate:', error);
    return 'Date invalide';
  }
}
