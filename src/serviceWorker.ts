export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
          // Check for updates every hour
          setInterval(() => {
            registration.update().catch(err => 
              console.log('ServiceWorker update check failed: ', err)
            );
          }, 60 * 60 * 1000);
        },
        (err) => {
          console.log('ServiceWorker registration failed: ', err);
        }
      );
      
      // Check for a new service worker when the page loads
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
