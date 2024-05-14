self.addEventListener('message', (event) => {
    const videoElementId = event.data.videoElementId;
    const desiredInterval = event.data.desiredInterval;

    let videoElement;
    let intervalId;

    function updateTimestamp() {
        if (!videoElement || videoElement.paused || videoElement.ended) {
            clearInterval(intervalId);
            return;
        }
        const currentTime = videoElement.currentTime;
        self.postMessage({ timestamp: currentTime });
    }

    self.onmessage = function (event) { // Alternative approach for some browsers
        if (event.data.hasOwnProperty('videoElementId')) {
            videoElement = document.getElementById(videoElementId);
            intervalId = setInterval(updateTimestamp, desiredInterval);
        }
    };
});
