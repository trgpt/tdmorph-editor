
// Image Editor Logic
const editorCanvas = document.getElementById('editorCanvas');
const ctx = editorCanvas.getContext('2d');
let originalImage = null;

document.getElementById('uploadEditor').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      editorCanvas.width = img.width;
      editorCanvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      originalImage = ctx.getImageData(0, 0, img.width, img.height);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

function applyFilter(type) {
  if (!originalImage) return;
  const imageData = ctx.getImageData(0, 0, editorCanvas.width, editorCanvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    if (type === 'grayscale') {
      const avg = (r + g + b) / 3;
      data[i] = data[i + 1] = data[i + 2] = avg;
    } else if (type === 'sepia') {
      data[i] = r * 0.393 + g * 0.769 + b * 0.189;
      data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
      data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function rotateImage() {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = editorCanvas.height;
  tempCanvas.height = editorCanvas.width;
  tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
  tempCtx.rotate(Math.PI / 2);
  tempCtx.drawImage(editorCanvas, -editorCanvas.width / 2, -editorCanvas.height / 2);
  editorCanvas.width = tempCanvas.width;
  editorCanvas.height = tempCanvas.height;
  ctx.drawImage(tempCanvas, 0, 0);
}

function resetCanvas() {
  if (originalImage) ctx.putImageData(originalImage, 0, 0);
}

function downloadEditorImage() {
  const link = document.createElement('a');
  link.download = 'edited-image.png';
  link.href = editorCanvas.toDataURL();
  link.click();
}

// Face Morphing Logic
async function startMorphing() {
  const faceAInput = document.getElementById('faceA');
  const faceBInput = document.getElementById('faceB');
  if (!faceAInput.files[0] || !faceBInput.files[0]) return alert('Upload both faces');

  await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/models');

  const imgA = await loadImage(faceAInput.files[0]);
  const imgB = await loadImage(faceBInput.files[0]);

  drawOnCanvas(imgA, 'canvasA');
  drawOnCanvas(imgB, 'canvasB');
  blendImages(imgA, imgB, 'canvasBlend');
}

function loadImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function drawOnCanvas(img, canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
}

function blendImages(imgA, imgB, canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const width = Math.min(imgA.width, imgB.width);
  const height = Math.min(imgA.height, imgB.height);
  canvas.width = width;
  canvas.height = height;
  ctx.globalAlpha = 0.5;
  ctx.drawImage(imgA, 0, 0, width, height);
  ctx.drawImage(imgB, 0, 0, width, height);
  ctx.globalAlpha = 1.0;
}

function downloadCanvas(id) {
  const canvas = document.getElementById(id);
  const link = document.createElement('a');
  link.download = `${id}.png`;
  link.href = canvas.toDataURL();
  link.click();
}
