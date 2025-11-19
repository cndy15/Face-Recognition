<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FaceRecController;

// Halaman enroll (Blade)
Route::get('/face/enroll', function () {
    return view('enroll');
});

// Endpoint menerima upload (multipart/form-data) — dipakai untuk upload file & webcam
Route::post('/face/enroll', [FaceRecController::class, 'enroll']);

// Endpoint untuk mengambil daftar wajah (dipakai live recognition untuk load labeled images)
Route::get('/api/faces', [FaceRecController::class, 'listFaces']);

// (Optional) endpoint mark attendance
Route::post('/api/mark-attendance', [FaceRecController::class, 'markAttendance']);
