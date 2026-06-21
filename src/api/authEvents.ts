type Listener = () => void;

class AuthEvents {
  private listeners: Listener[] = [];

  subscribe(l: Listener) {
    this.listeners.push(l);
    return () => {
      this.listeners = this.listeners.filter(idx => idx !== l);
    };
  }

  emitLogout() {
    this.listeners.forEach(l => l());
  }
}

export const authEvents = new AuthEvents();