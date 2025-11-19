// --- Inisialisasi model face-api.js ---
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/face/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/face/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/face/models')
]).then(() => {
  console.log("✅ Model face-api.js siap digunakan");
});


// Di bagian atas file face.js, tambahkan ini:
// Fungsi helper untuk get CSRF token
function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content || '';
}

// BAGIAN 1 — ENROLL WAJAH (UPLOAD FOTO)
const uploadForm = document.getElementById('uploadForm');

if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const file = document.getElementById('file').files[0];
    const status = document.getElementById('status');

    if (!name || !file) {
      status.innerText = "❌ Nama dan foto wajib diisi!";
      status.style.color = 'red';
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', file);  // ✅ UBAH 'photo' jadi 'image'

    status.innerText = "⏳ Mengunggah dan menyimpan...";
    status.style.color = 'blue';

    try {
      const response = await fetch('http://127.0.0.1:8000/face/enroll', {
        method: 'POST',
        body: formData
      });

      // Cek apakah response JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server response:', text);
        throw new Error('Server mengembalikan HTML, bukan JSON. Cek backend!');
      }

      const data = await response.json();
      
      console.log('Response:', data); // Debug
      
      if (data.success) {
        status.innerText = data.message || "✅ Wajah berhasil disimpan!";
        status.style.color = 'green';
        uploadForm.reset(); // Reset form
      } else {
        status.innerText = data.message || "❌ Gagal menyimpan wajah";
        status.style.color = 'red';
      }

    } catch (err) {
      console.error('Upload error:', err);
      
      let errorMsg = "❌ Gagal menyimpan wajah";
      if (err.message.includes("JSON")) {
        errorMsg = "❌ Server error: Endpoint mengembalikan HTML bukan JSON";
      } else if (err.message.includes("Failed to fetch")) {
        errorMsg = "❌ Tidak dapat terhubung ke server. Pastikan server berjalan!";
      } else if (err.message) {
        errorMsg = "❌ " + err.message;
      }
      
      status.innerText = errorMsg;
      status.style.color = 'red';
    }
  });
}
          'X-CSRF-TOKEN': getCsrfToken()  // ⭐ TAMBAHKAN INI
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        status.innerText = `✅ ${data.message}`;
      } else {
        const error = await res.json();
        status.innerText = `❌ Gagal: ${error.message || 'Kesalahan server'}`;
      }
    } catch (error) {
      console.error('Error:', error);
      status.innerText = "❌ Gagal menyimpan wajah: " + error.message;
    }
  });
}

// BAGIAN 2 — ENROLL DARI WEBCAM
const video = document.getElementById('video');
if (video) {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => (video.srcObject = stream))
    .catch(err => console.error("Gagal akses kamera:", err));

  const captureBtn = document.getElementById('capture');
  if (captureBtn) {
    captureBtn.addEventListener('click', async () => {
      const nameCam = document.getElementById('nameCam').value;
      const statusCam = document.getElementById('statusCam');

      if (!nameCam) {
        statusCam.innerText = "❌ Nama tidak boleh kosong";
        return;
      }

      const canvas = faceapi.createCanvasFromMedia(video);
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        statusCam.innerText = "❌ Wajah tidak terdeteksi, coba lagi";
        return;
      }

      // Simpan hasil capture jadi file gambar sementara
      const snapshot = canvas.toDataURL('image/jpeg');
      const blob = await (await fetch(snapshot)).blob();
      const formData = new FormData();
      formData.append('name', nameCam);
      formData.append('photo', blob, `${nameCam}.jpg`);

      statusCam.innerText = "⏳ Mengirim data wajah...";

      try {
        const res = await fetch('/face/enroll', {  // ⭐ UBAH DARI /api/enroll-face
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': getCsrfToken()  // ⭐ TAMBAHKAN INI
          },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          statusCam.innerText = `✅ ${data.message}`;
        } else {
          const error = await res.json();
          statusCam.innerText = `❌ Gagal: ${error.message || 'Kesalahan server'}`;
        }
      } catch (error) {
        console.error('Error:', error);
        statusCam.innerText = "❌ Gagal menyimpan dari webcam: " + error.message;
      }
    });
  }
}

// BAGIAN 3 — RECOGNIZE WAJAH (ABSENSI LIVE)
async function loadLabeledImages() {
  const res = await fetch('/api/faces');
  const faces = await res.json();
  const labeledDescriptors = [];

  for (const face of faces) {
    const img = await faceapi.fetchImage(face.url);
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(face.name, [detection.descriptor]));
    }
  }
  return labeledDescriptors;
}

// Jalankan hanya jika ada video webcam di halaman (recognize.html)
if (document.title.includes('Live Recognition')) {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/face/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/face/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/face/models')
  ]).then(startRecognition);
}

async function startRecognition() {
  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  const video = document.getElementById('video');

  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => (video.srcObject = stream))
    .catch(err => console.error("Gagal akses kamera:", err));

  video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

      const results = resizedDetections.map(d =>
        faceMatcher.findBestMatch(d.descriptor)
      );

      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
        drawBox.draw(canvas);

        // Jika wajah cocok → kirim absen ke backend
        if (!result.toString().includes("unknown")) {
          fetch('/api/mark-attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: result.label })
          });
        }
      });
    }, 1000);
  });
}




// const MODEL_URL = '/face/models';
// let faceMatcher = null;

// async function loadModels() {
//   await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
//   await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
//   await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
// }

// async function getFacesFromServer() {
//   const res = await fetch('/api/faces');
//   return res.json();
// }

// async function buildMatcher() {
//   const list = await getFacesFromServer();
//   const labeled = [];
//   for (const p of list) {
//     const img = await faceapi.fetchImage(p.url);
//     const det = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
//     if (det) labeled.push(new faceapi.LabeledFaceDescriptors(p.name, [det.descriptor]));
//   }
//   faceMatcher = new faceapi.FaceMatcher(labeled, 0.55);
//   return labeled.length;
// }

// async function startVideo(video) {
//   const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//   video.srcObject = stream;
// }

// // ========== ENROLL FOTO / WEBCAM ==========
// document.addEventListener('DOMContentLoaded', async () => {
//   await loadModels();

//   // upload file
//   const form = document.getElementById('uploadForm');
//   form?.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const name = document.getElementById('name').value;
//     const file = document.getElementById('file').files[0];
//     const fd = new FormData();
//     fd.append('name', name);
//     fd.append('photo', file);
//     const res = await fetch('/api/enroll-face', { method: 'POST', body: fd });
//     const j = await res.json();
//     document.getElementById('status').innerText = j.message;
//   });

//   // webcam enroll
//   const video = document.getElementById('video');
//   const capture = document.getElementById('capture');
//   if (video) startVideo(video);

//   capture?.addEventListener('click', async () => {
//     const name = document.getElementById('nameCam').value;
//     const canvas = document.createElement('canvas');
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     canvas.getContext('2d').drawImage(video, 0, 0);
//     canvas.toBlob(async (blob) => {
//       const fd = new FormData();
//       fd.append('name', name);
//       fd.append('photo', blob, 'capture.jpg');
//       const res = await fetch('/api/enroll-face', { method: 'POST', body: fd });
//       const j = await res.json();
//       document.getElementById('statusCam').innerText = j.message;
//     });
//   });

//   // recognition
//   if (location.pathname.includes('recognize.html')) {
//     const video = document.getElementById('video');
//     await startVideo(video);
//     const log = document.getElementById('log');
//     const count = await buildMatcher();
//     log.innerText = `Loaded ${count} faces`;

//     video.addEventListener('play', () => {
//       setInterval(async () => {
//         const dets = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
//         if (dets.length === 0) return;
//         for (const d of dets) {
//           const best = faceMatcher.findBestMatch(d.descriptor);
//           log.innerText = best.toString();
//           if (best.label !== 'unknown') {
//             await fetch('/api/mark-attendance', {
//               method: 'POST',
//               headers: {'Content-Type':'application/json'},
//               body: JSON.stringify({ name: best.label })
//             });
//           }
//         }
//       }, 900);
//     });
//   }
//});
