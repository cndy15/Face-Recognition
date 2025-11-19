<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FaceController extends Controller
{
    public function enroll(Request $request)
    {
        Log::info('=== Enroll Request ===');
        Log::info('Name: ' . $request->input('name'));
        Log::info('Has Image: ' . ($request->hasFile('image') ? 'YES' : 'NO'));
        
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120'
            ]);

            $name = $request->input('name');
            $image = $request->file('image');

            // Buat folder
            $facesPath = public_path('faces');
            if (!file_exists($facesPath)) {
                mkdir($facesPath, 0777, true);
            }

            // Simpan file
            $filename = time() . '_' . preg_replace('/[^A-Za-z0-9_\-]/', '_', $name) . '.' . $image->getClientOriginalExtension();
            $image->move($facesPath, $filename);

            Log::info("File saved: {$filename}");

            return response()->json([
                'success' => true,
                'message' => "✅ Wajah {$name} berhasil disimpan!",
                'filename' => $filename
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => '⚠️ ' . implode(', ', $e->validator->errors()->all())
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '❌ Error: ' . $e->getMessage()
            ], 500);
        }
    }
}

// namespace App\Http\Controllers;

// abstract class Controller
// {
//     //
// }

