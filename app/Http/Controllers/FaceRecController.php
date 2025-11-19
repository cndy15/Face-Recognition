<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FaceRecController extends Controller
{
    // menerima multipart/form-data (field 'name' dan 'image')
    public function enroll(Request $request)
    {
        try {
            // validasi (image optional tipe jpeg/png)
            $request->validate([
                'name' => 'required|string|max:255',
                'image' => 'required|image|mimes:jpeg,png,jpg|max:8192' // max 8MB
            ]);

            $name = $request->input('name');
            $file = $request->file('image');

            // buat filename aman
            $safeName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $name);
            $filename = time() . '_' . $safeName . '.' . $file->getClientOriginalExtension();

            // simpan ke storage/app/public/faces
            $path = $file->storeAs('faces', $filename, 'public');

            return response()->json([
                'success' => true,
                'message' => "Wajah {$name} berhasil disimpan.",
                'path' => Storage::url($path) // /storage/faces/...
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'success' => false,
                'message' => $ve->validator->errors()->first()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan: ' . $e->getMessage()
            ], 500);
        }
    }

    // daftar semua foto yang sudah tersimpan (ambil nama dari filename atau dari database kalau nanti ditambah)
    public function listFaces()
    {
        $files = Storage::files('public/faces');
        $faces = [];

        foreach ($files as $f) {
            $filename = basename($f);
            // nama awal diambil dari filename tanpa timestamp, sesuaikan jika ingin database
            $label = preg_replace('/^\d+_/', '', pathinfo($filename, PATHINFO_FILENAME));
            $faces[] = [
                'name' => $label,
                'url' => Storage::url('faces/' . $filename)
            ];
        }

        return response()->json($faces);
    }

    // very simple mark attendance (append to storage/logs/attendance.log)
    public function markAttendance(Request $request)
    {
        $request->validate(['name' => 'required|string']);
        $name = $request->input('name');
        $line = '[' . now() . "] $name hadir\n";
        // simpan ke storage/logs/attendance.log
        $logPath = storage_path('logs/attendance.log');
        file_put_contents($logPath, $line, FILE_APPEND);
        return response()->json(['status' => 'ok']);
    }
}
