const canvas = document.getElementById("canvas")
const video = document.querySelector("video")
const imageContainer = document.getElementById("image-container")
const ctx = canvas.getContext('2d')
const frame = document.getElementById("frame")
const save_image_btn = document.getElementById('save_image')
const draw_btn = document.getElementById('draw')
let annotations = {}

const ink = { YELLOW: "FFCD2E", RED: "FF584E", BLUE: "4EB4FF" }
let selectedInk = 'YELLOW'

frame.addEventListener('click', () => { video.play() })

function toggleCanvas(state) {
    switch (state) {
        case 'SHOW':
            draw_btn.style.background = '#' + ink.YELLOW
            draw_btn.style.color = 'black'
            save_image_btn.style.display = 'inline-block'
            canvas.style.visibility = 'visible'

            break;

        case 'HIDE':
            draw_btn.style.background = '#282828'
            draw_btn.style.color = '#e2e2e2'
            save_image_btn.style.display = 'none'
            canvas.style.visibility = 'hidden'
            break;

        case 'TOGGLE':
            if (canvas.style.visibility == 'visible') {
                draw_btn.style.background = '#282828'
                draw_btn.style.color = '#e2e2e2'
                save_image_btn.style.display = 'none'
                canvas.style.visibility = 'hidden'
            }
            else {
                draw_btn.style.background = '#' + ink.YELLOW
                draw_btn.style.color = 'black'
                save_image_btn.style.display = 'inline-block'
                canvas.style.visibility = 'visible'
            }
            break;

        default:
            break;
    }

}

function captureImageAtTime(time) {
    canvas.style.width = video.clientWidth + 'px';
    canvas.style.height = video.clientHeight + 'px';
    // const canvas = document.createElement("canvas");
    // const ctx = canvas.getContext("2d");
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    video.currentTime = time;
    video.pause();
    ctx.drawImage(video, 0, 0, video.clientWidth, video.clientHeight);

    save_image_btn.style.display = 'inline-block'

    // const imgDataUrl = canvas.toDataURL("image/png"); // Change format if needed

    // const image = document.createElement("img");
    // image.src = imgDataUrl;

    // imageContainer.appendChild(image);
}

function showImage() {
    imageContainer.innerHTML = ''

    Object.keys(annotations).forEach(annotation => {
        const image = document.createElement("img");
        image.src = annotations[Number(annotation).toFixed(2)];
        imageContainer.appendChild(image);
    });
}


function saveImage() {
    // draw_btn.style.background = '#282828'
    // draw_btn.style.color = '#e2e2e2'
    const time = video.currentTime.toFixed(2)

    const imgDataUrl = canvas.toDataURL("image/png"); // Change format if needed

    const image = document.createElement("img");
    image.src = imgDataUrl;

    annotations[time] = imgDataUrl;

    const bubble = document.createElement("div");
    const preview = document.createElement("img");
    preview.src = imgDataUrl
    bubble.className = 'bubble'
    bubble.classList.add('border-' + selectedInk.toLowerCase())
    bubble.setAttribute('data-time', time)
    bubble.appendChild(preview)
    // imageContainer.appendChild(image);
    seek.appendChild(bubble)

    bubble.style.left = ((video.currentTime / video.duration) * video.clientWidth) - 3 + 'px'

    bubble.addEventListener('click', () => {
        video.pause()
        video.currentTime = time
    })


    image.remove();
    clearCanvas();

    toggleCanvas('HIDE')
    save_image_btn.style.display = 'none'
}


let isDrawing = false;
let startX, startY;

// Function to draw on canvas
function draw(e) {
    toggleCanvas('SHOW')
    console.log(video.clientTop);
    canvas.style.top = video.getClientRects()[0].y + 'px'
    canvas.style.left = video.getClientRects()[0].x + 'px'

    // canvas.style.top = video.style.clientTop + 'px'
    // canvas.style.left = video.style.clientLeft + 'px'
    if (!isDrawing) return;



    // primary
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = selectedInk; // Change color as desired
    ctx.stroke();


    startX = e.offsetX;
    startY = e.offsetY;
}

// Event listeners for drawing
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    ctx.beginPath();
});

canvas.addEventListener('mouseout', () => {
    isDrawing = false;
});

canvas.addEventListener('mousemove', draw);

// Function to clear drawings
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let timestamps = {}

function checkForAnnotation() {
    console.log('sad');
    Object.keys(annotations).forEach(e => {
        // console.table({ annotation_time: Number(e), current_time: video.currentTime.toFixed(2), difference: Number(e) - video.currentTime.toFixed(2) })
        // console.log(`annotation_time ${Number(e)} - video.currentTime ${video.currentTime.toFixed(2) } = ${Number(e) - video.currentTime.toFixed(2) }`);
        console.log(Number(e) - video.currentTime.toFixed(2));

        if (Number(e) - video.currentTime.toFixed(2) > -0.3 && Number(e) - video.currentTime.toFixed(2) < 0) {
            console.log('clear image');
            frame.src = ''
        }

        if (video.currentTime.toFixed(2) == Number(e) || (Number(e) - video.currentTime.toFixed(2) < 0.3 && Number(e) - video.currentTime.toFixed(2) > 0)) {
            console.log('add image');
            frame.src = annotations[e];
            frame.style.left = video.getClientRects()[0].x + 'px'
            frame.style.top = video.getClientRects()[0].y + 'px'
        }


    });

}

// Update canvas with video frame (optional for live drawing)
function updateCanvas() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

// Call updateCanvas on video play/seek (optional)
video.addEventListener('play', updateCanvas);
video.addEventListener('seeked', updateCanvas);
video.addEventListener('timeupdate', () => {
    checkForAnnotation()
    timeCompleted.style.width = (video.currentTime / video.duration) * video.clientWidth + 'px'
    // console.log(video.currentTime);
})

let seek = document.querySelector('.seek');
let timeCompleted = document.querySelector('.seeked');

video.addEventListener('loadedmetadata', () => {
    // console.log(video.duration);

    seek.style.top = (video.getClientRects()[0].y + video.clientHeight) + 8 + 'px'
    seek.style.left = video.getClientRects()[0].x + 'px'
    seek.style.width = video.clientWidth + 'px';
})


video.addEventListener('keypress', (e) => {
    console.log(e.key);
    if (video.paused) {
        toggleCanvas('HIDE')
    }
    if (e.key === 'd') {
        if (canvas.style.visibility !== 'visible') {
            console.log("her");
            draw(captureImageAtTime(video.currentTime))
        }
        else {
            console.log("headr");
            toggleCanvas('HIDE')
            video.play()
        }
    }
})
