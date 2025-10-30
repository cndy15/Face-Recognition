@echo off
echo ============================
echo  Jalankan Flask + Laravel
echo ============================

:: Buka Anaconda Prompt dan jalankan Flask
start "" "%windir%\System32\cmd.exe" /K "call D:\anaconda\Scripts\activate.bat facerec && cd C:\xampp\htdocs\FaceRecLaravel\python && python stream.py"

:: Buka Command Prompt untuk Laravel
start "" "%windir%\System32\cmd.exe" /K "cd C:\xampp\htdocs\FaceRecLaravel && php artisan serve"

echo Semua server sedang dijalankan...
pause
