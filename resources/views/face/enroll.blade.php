<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>Enroll Wajah</title>

  <style>
    /* (silakan pakai style yang kamu suka; saya pakai ringkas agar contoh fokus ke fungsi) */
    body { font-family: Arial, sans-serif; background: #f3f6fb; padding: 20px; }
    .card { max-width: 720px; margin: 20px auto; background: #fff; padding: 24px; border-radius: 10px; box-shadow: 0 6px 24px rgba(0,0,0,0.08); }
    input, button { font-size: 16px; padding: 10px; }
    video { max-width: 100%; border-radius: 8px; border: 3px solid #3b82f6; }
    .status { margin-top: 12px; padding: 10px; display:none; border-radius:6px; }
    .status.show { display:block; }
    .status.success { background:#e6ffed; color:#065f46; }
    .status.error { background:#ffe6e6; color:#842029; }
  </style>
</head>
<body>
  <input type="file" id="imageInput" accept="image/*">
<button id="captureBtn">Ambil dari Webcam</button>
<video id="video" autoplay style="width:300px;"></video>
<canvas id="canvas" style="display:none;"></canvas>

<div id="message"></div>

<script>
// =====================
// START WEBCAM
// =====================
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
    document.getElementById("video").srcObject = stream;
});

// =====================
// CONVERT BASE64 TO BLOB
// =====================
function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// =====================
// CAPTURE WEBCAM
// =====================
document.getElementById("captureBtn").onclick = function () {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const dataURL = canvas.toDataURL("image/png");  
    const blob = dataURLtoBlob(dataURL);

    uploadImage(blob);
};

// =====================
// UPLOAD FROM FILE
// =====================
document.getElementById("imageInput").onchange = function () {
    const file = this.files[0];
    uploadImage(file);
};

// =====================
// UPLOAD FUNCTION
// =====================
function uploadImage(blob) {
    const formData = new FormData();
    formData.append("image", blob);

    fetch("/enroll/upload", {
        method: "POST",
        headers: {
            "X-CSRF-TOKEN": "{{ csrf_token() }}"
        },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("message").innerHTML = 
            `<span style="color:green;">${data.message}</span>`;
    })
    .catch(err => {
        document.getElementById("message").innerHTML = 
            `<span style="color:red;">Gagal: ${err}</span>`;
    });
}
</script>
</body>
</html>
