@echo off
echo Creating app icons...

:: Create icons directory
mkdir "ui\src-tauri\icons" 2>nul

:: Download or create icons using ImageMagick or create SVG
echo ^<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"^>^<defs^>^<linearGradient id="grad" x1="0%%" y1="0%%" x2="100%%" y2="100%%"^>^<stop offset="0%%" style="stop-color:rgb(103,126,234);stop-opacity:1" /^>^<stop offset="100%%" style="stop-color:rgb(79,172,254);stop-opacity:1" /^>^</linearGradient^>^</defs^>^<rect width="128" height="128" rx="24" fill="url(#grad)"/^>^<path d="M 64 32 L 84 52 L 64 52 L 64 72 L 84 72 L 64 92 L 44 72 L 64 72 L 64 52 L 44 52 Z" fill="white" opacity="0.9"/^>^</svg^> > "ui\src-tauri\icons\icon.svg"

echo Icons directory created. You'll need to generate PNG/ICO files.
echo.
echo For now, let's use a simpler approach...
pause
