@echo off
setlocal
cd /d "%~dp0"
set "JAVA_HOME=C:\Users\Atnan\.jdks\jdk21.0.12_12"
set "ANDROID_HOME=C:\Users\Atnan\AppData\Local\Android\Sdk"

echo ========================================================
echo   Membangun APK Android BukuKasir UMKM
echo ========================================================
echo.

echo [1/3] Menyiapkan aset web...
node prepare-www.js
if %errorlevel% neq 0 (
    echo Gagal menyiapkan aset web.
    pause
    exit /b %errorlevel%
)

echo [2/3] Sinkronisasi Capacitor Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Gagal sinkronisasi Capacitor.
    pause
    exit /b %errorlevel%
)

echo [3/3] Kompilasi APK dengan Gradle...
cd android
call gradlew.bat assembleDebug
set BUILD_STATUS=%errorlevel%
cd ..

if %BUILD_STATUS% neq 0 (
    echo.
    echo [ERROR] Gagal mengompilasi APK.
    pause
    exit /b %BUILD_STATUS%
)

if not exist "dist-apk" mkdir "dist-apk"
copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "dist-apk\BukuKasir-UMKM-v1.0.apk" >nul

echo.
echo ========================================================
echo   BERHASIL! Berkas APK siap diinstal di ponsel/POS Android:
echo   dist-apk\BukuKasir-UMKM-v1.0.apk
echo ========================================================
echo.
pause
