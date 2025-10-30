import sys
import os

print("Python Test Script")
print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")
print(f"Current directory: {os.getcwd()}")
print(f"Arguments received: {sys.argv}")

# Test if we can import yt-dlp
try:
    import yt_dlp
    print("✅ yt-dlp is installed")
except ImportError:
    print("❌ yt-dlp is NOT installed")

# Check if main.py exists
main_py = os.path.join(os.path.dirname(__file__), 'main.py')
if os.path.exists(main_py):
    print(f"✅ main.py found at: {main_py}")
else:
    print(f"❌ main.py NOT found at: {main_py}")

print("\nTest completed successfully!")
