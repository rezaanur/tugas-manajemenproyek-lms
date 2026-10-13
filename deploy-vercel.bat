@echo off
title Deploy EduSmart LMS ke Vercel
color 0b
echo ====================================================
echo        DEPLOY EDUSMART LMS KE VERCEL
echo ====================================================
echo.
echo Langkah 1: Memeriksa autentikasi Vercel...
echo.
call npx vercel whoami
if %errorlevel% neq 0 (
    echo.
    echo Akun Vercel belum login.
    echo Browser akan terbuka untuk konfirmasi akun Vercel Anda...
    echo.
    call npx vercel login
)

echo.
echo Langkah 2: Memulai proses build dan deploy ke Vercel Production...
echo.
call npx vercel --prod

echo.
echo ====================================================
echo Proses deploy selesai! Cek URL Vercel di atas.
echo ====================================================
pause
