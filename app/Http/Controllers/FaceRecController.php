<?php


namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FaceRecController extends Controller
{
    public function index()
    {
        return view('face');
    }
}


// namespace App\Http\Controllers;

// use Illuminate\Http\Request;

// class FaceRecController extends Controller
// {
//     public function detect()
//     {
//         // Path Python environment (ubah jika perlu)
//         $pythonPath = 'D:\\envs\\facerec\\python.exe';
//         $scriptPath = 'C:\\xampp\\htdocs\\FaceRecLaravel\\python\\facerecognition2.py';

//         // Perintah lengkap
//         $command = "\"$pythonPath\" \"$scriptPath\" 2>&1";

//         // Debug: tampilkan perintah yang dijalankan
//         echo "<b>Menjalankan perintah:</b><br>$command<br><br>";

//         // Jalankan dan ambil hasilnya
//         $output = shell_exec($command);

//         if (!$output) {
//             $output = "⚠️ Tidak ada output dari Python. 
//                        Mungkin path salah atau environment belum aktif.";
//         }

//         echo "<b>Output Python:</b><pre>$output</pre>";
//     }
// }



// namespace App\Http\Controllers;

// use Illuminate\Http\Request;

// class FaceRecController extends Controller
// {
//     public function runPython()
//     {
//         // Path ke script Python kamu
//         $pythonScript = 'C:\\xampp\\htdocs\\FaceRecLaravel\\python\\facerecognition2.py';

//         // Jalankan Python pakai shell_exec
//         $output = shell_exec("python \"$pythonScript\" 2>&1");

//         // Tampilkan hasil di browser
//         return response("<pre>$output</pre>");
//     }
// }
