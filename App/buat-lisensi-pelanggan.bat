@echo off
chcp 65001 >nul
title Generator Lisensi Resmi BukuKasir UMKM
color 0A

echo ==============================================================
echo        GENERATOR LISENSI RESMI BUKUKASIR UMKM (OFFLINE)
echo ==============================================================
echo.
echo Masukkan data pembeli untuk menerbitkan lisensi resmi:
echo.

set /p STORE_NAME="1. Masukkan Nama Toko (Wajib)      : "
if "%STORE_NAME%"=="" (
    echo [ERROR] Nama Toko tidak boleh kosong!
    pause
    exit /b
)

set /p CUST_NAME="2. Masukkan Nama Pembeli (Opsional) : "
if "%CUST_NAME%"=="" set CUST_NAME=Pemilik Toko

set /p INV_NUM="3. Masukkan No. Invoice / Order ID   : "
if "%INV_NUM%"=="" set INV_NUM=INV-DIRECT

echo.
echo Pilih Paket Edisi Software:
echo   [1] Edisi Retail & Sembako (Rp 149.000)
echo   [2] Edisi Kafe & Rumah Makan F&B (Rp 229.000)
echo   [3] Edisi Percetakan & Jasa Fotokopi (Rp 229.000)
echo   [4] Edisi Ultimate Multi-Usaha / All-in-One (Rp 299.000)
set /p EDITION_CHOICE="Pilih nomor edisi (1-4) [Default: 4] : "

set EDITION_KEY=ultimate
if "%EDITION_CHOICE%"=="1" set EDITION_KEY=retail
if "%EDITION_CHOICE%"=="2" set EDITION_KEY=cafe
if "%EDITION_CHOICE%"=="3" set EDITION_KEY=printing
if "%EDITION_CHOICE%"=="4" set EDITION_KEY=ultimate

echo.
echo Sedang memproses kunci lisensi dan membuat sertifikat resmi...
echo.

node scripts/buat-lisensi.js "%STORE_NAME%" "%CUST_NAME%" "%INV_NUM%" "%EDITION_KEY%"

echo.
echo ==============================================================
echo File sertifikat siap cetak telah dibuat di folder:
echo "paket-penjualan\arsip-lisensi\"
echo ==============================================================
echo.
set /p OPEN_CERT="Buka sertifikat di browser untuk dicetak? (Y/N): "
if /i "%OPEN_CERT%"=="Y" (
    start "" "paket-penjualan\arsip-lisensi\"
)

pause
