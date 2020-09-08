const video = document.getElementById('video');
const expressionsList = document.getElementById('expressions-list');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  );
}

video.addEventListener('playing', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.getElementById("video-container").append(canvas);
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const expressionObj = detections[0] ? detections[0].expressions : {};
    const expressionKeys = Object.keys(expressionObj);
    expressionKeys.sort((a,b) => {
        return expressionObj[b] - expressionObj[a];
    });

    if (expressionsList) {
        while (expressionsList.childNodes.length > 0) {
            expressionsList.removeChild(expressionsList.childNodes[0]);
        }
    }
    
    for (i = 0; i < 2; i++) {
        var node = document.createElement("li");  
        node.className = 'collection-item';      
        var textnode = document.createTextNode(expressionKeys[i]);  
        node.appendChild(textnode);
        document.getElementById("expressions-list").appendChild(node); 
    }
    
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 1000);
})