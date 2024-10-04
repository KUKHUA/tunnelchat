self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'START_SSE') {
        startSSE(event.data.url);
    }
});

function startSSE(url) {
    const eventSource = new EventSource(url);

    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        showNotification(`Message from ${data.displayName}`, data.message);
    };

    eventSource.onerror = function(error) {
        console.error('EventSource failed:', error);
        eventSource.close();
    };
}

function showNotification(title, message) {
    self.registration.showNotification(title, {
        body: message,
    });
}