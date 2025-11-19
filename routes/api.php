<?php
use App\Http\Controllers\FaceController;
Route::post('/face/enroll', [FaceRecognitionController::class, 'enroll']);
Route::post('/face/save-from-webcam', [FaceRecognitionController::class, 'saveFromWebcam']);

// Route::post('/face/enroll', [FaceController::class, 'enroll']);
// Route::get('/face/enroll.html', function() {
//     return view('face.enroll'); // atau return file HTML
// });

// use App\Http\Controllers\FaceController;

// Route::post('/enroll-face', [FaceController::class, 'store']);
// Route::get('/faces', [FaceController::class, 'getFaces']);
// Route::post('/mark-attendance', [FaceController::class, 'markAttendance']);