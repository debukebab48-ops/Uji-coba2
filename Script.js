const videoElement = document.getElementById('webcam');
const puppetLeft = document.getElementById('puppet-left');
const puppetRight = document.getElementById('puppet-right');
const statusText = document.getElementById('status');

// Initial positions
let targets = {
    left: { x: 20, y: window.innerHeight / 2 },
    right: { x: window.innerWidth - 270, y: window.innerHeight / 2 }
};
let current = {
    left: { x: 20, y: window.innerHeight / 2 },
    right: { x: window.innerWidth - 270, y: window.innerHeight / 2 }
};

// Handle window resize
window.addEventListener('resize', () => {
    targets.right.x = window.innerWidth - 270;
});

function onResults(results) {
    statusText.innerText = results.multiHandLandmarks.length > 0 ? "Tangan Terdeteksi" : "Menunggu tangan...";

    puppetLeft.classList.remove('is-pointing');
    puppetRight.classList.remove('is-pointing');

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const landmarks = results.multiHandLandmarks[i];
            const isRightHand = results.multiHandedness[i].label === 'Right';

            // Use landmarks[9] (middle finger base) as the center point for smoother tracking
            const targetX = (1 - landmarks[9].x) * window.innerWidth;
            const targetY = landmarks[9].y * window.innerHeight;

            // Gesture logic
            const indexTip = landmarks[8];
            const indexPip = landmarks[6];
            const middleTip = landmarks[12];
            const middlePip = landmarks[10];
            
            const isPointing = indexTip.y < indexPip.y && middleTip.y > middlePip.y;

            if (isRightHand) {
                targets.left = { x: targetX - 125, y: targetY }; 
                if (isPointing) puppetLeft.classList.add('is-pointing');
            } else {
                targets.right = { x: targetX - 125, y: targetY };
                if (isPointing) puppetRight.classList.add('is-pointing');
            }
        }
    }
}

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 0, // 0 = fastest, 1 = more accurate but laggy
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 480,  // Smaller resolution to reduce lag
    height: 360
});

camera.start().catch((err) => {
    statusText.innerText = "Gagal akses kamera. Pastikan pakai HTTPS.";
    console.error(err);
});

// Smooth animation loop
function render() {
    const easing = 0.15; // Higher = faster snap, Lower = smoother but laggier feel

    current.left.x += (targets.left.x - current.left.x) * easing;
    current.left.y += (targets.left.y - current.left.y) * easing;
    
    current.right.x += (targets.right.x - current.right.x) * easing;
    current.right.y += (targets.right.y - current.right.y) * easing;

    // Translate only, to minimize GPU repaints
    puppetLeft.style.transform = `translate3d(${current.left.x}px, ${current.left.y}px, 0) translateY(-50%)`;
    puppetRight.style.transform = `translate3d(${current.right.x}px, ${current.right.y}px, 0) translateY(-50%)`;

    requestAnimationFrame(render);
}

render();