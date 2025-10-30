import customtkinter as ctk
import tkinter as tk
from tkinter import filedialog, messagebox
import threading
import sys
import os
from pathlib import Path
import subprocess
import queue
import re

# Set appearance mode and color theme
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

class ModernYouTubeDownloader(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Window configuration
        self.title("L1ght Video Downloader")
        self.geometry("900x700")
        self.minsize(800, 600)
        
        # Center window on screen
        self.center_window()
        
        # Variables
        self.download_path = tk.StringVar(value=str(Path.home() / "Videos"))
        self.url_var = tk.StringVar()
        self.quality_var = tk.StringVar(value="best")
        self.is_downloading = False
        self.progress_queue = queue.Queue()
        
        # Configure grid
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        # Create UI
        self.create_header()
        self.create_main_content()
        self.create_footer()
        
        # Start checking progress queue
        self.check_progress_queue()
        
    def center_window(self):
        """Center window on screen"""
        self.update_idletasks()
        width = self.winfo_width()
        height = self.winfo_height()
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f'{width}x{height}+{x}+{y}')
        
    def create_header(self):
        """Create glassmorphic header"""
        header_frame = ctk.CTkFrame(
            self,
            fg_color=("gray85", "gray15"),
            corner_radius=0,
            height=100
        )
        header_frame.grid(row=0, column=0, sticky="ew", padx=0, pady=0)
        header_frame.grid_propagate(False)
        
        # Title with gradient effect
        title_label = ctk.CTkLabel(
            header_frame,
            text="L1GHT VIDEO",
            font=ctk.CTkFont(family="Segoe UI", size=38, weight="bold"),
            text_color=("#1f538d", "#3a9bff")
        )
        title_label.pack(pady=(20, 0))
        
        subtitle_label = ctk.CTkLabel(
            header_frame,
            text="Download YouTube videos in highest quality",
            font=ctk.CTkFont(family="Segoe UI", size=13),
            text_color=("gray40", "gray60")
        )
        subtitle_label.pack(pady=(5, 0))
        
    def create_main_content(self):
        """Create main content area with glassmorphism"""
        # Main container with padding
        main_container = ctk.CTkFrame(
            self,
            fg_color="transparent"
        )
        main_container.grid(row=1, column=0, sticky="nsew", padx=30, pady=20)
        main_container.grid_columnconfigure(0, weight=1)
        
        # URL Input Section
        url_frame = ctk.CTkFrame(
            main_container,
            fg_color=("gray90", "gray17"),
            corner_radius=20,
            border_width=2,
            border_color=("gray70", "gray25")
        )
        url_frame.grid(row=0, column=0, sticky="ew", pady=(0, 20))
        url_frame.grid_columnconfigure(0, weight=1)
        
        url_label = ctk.CTkLabel(
            url_frame,
            text="📎 YouTube URL",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        )
        url_label.grid(row=0, column=0, sticky="w", padx=25, pady=(20, 10))
        
        self.url_entry = ctk.CTkEntry(
            url_frame,
            textvariable=self.url_var,
            placeholder_text="Paste YouTube video link here...",
            height=50,
            font=ctk.CTkFont(size=14),
            corner_radius=12,
            border_width=0,
            fg_color=("gray95", "gray20")
        )
        self.url_entry.grid(row=1, column=0, sticky="ew", padx=25, pady=(0, 20))
        
        # Quality and Path Section
        options_frame = ctk.CTkFrame(
            main_container,
            fg_color=("gray90", "gray17"),
            corner_radius=20,
            border_width=2,
            border_color=("gray70", "gray25")
        )
        options_frame.grid(row=1, column=0, sticky="ew", pady=(0, 20))
        options_frame.grid_columnconfigure(1, weight=1)
        
        # Quality Selection
        quality_label = ctk.CTkLabel(
            options_frame,
            text="🎯 Quality",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        )
        quality_label.grid(row=0, column=0, sticky="w", padx=25, pady=(20, 10))
        
        quality_options = ["best", "720p", "480p", "audio"]
        quality_icons = {
            "best": "🏆 Best Quality",
            "720p": "📺 720p HD",
            "480p": "📱 480p SD",
            "audio": "🎵 Audio Only"
        }
        
        quality_menu = ctk.CTkOptionMenu(
            options_frame,
            values=[quality_icons[q] for q in quality_options],
            command=self.quality_changed,
            height=45,
            corner_radius=12,
            font=ctk.CTkFont(size=13),
            fg_color=("gray80", "gray25"),
            button_color=("#3a9bff", "#1f538d"),
            button_hover_color=("#5eb3ff", "#2d6bb5")
        )
        quality_menu.set(quality_icons["best"])
        quality_menu.grid(row=1, column=0, columnspan=2, sticky="ew", padx=25, pady=(0, 20))
        
        # Download Path
        path_label = ctk.CTkLabel(
            options_frame,
            text="📁 Save Location",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        )
        path_label.grid(row=2, column=0, sticky="w", padx=25, pady=(10, 10))
        
        path_inner_frame = ctk.CTkFrame(
            options_frame,
            fg_color="transparent"
        )
        path_inner_frame.grid(row=3, column=0, columnspan=2, sticky="ew", padx=25, pady=(0, 20))
        path_inner_frame.grid_columnconfigure(0, weight=1)
        
        self.path_entry = ctk.CTkEntry(
            path_inner_frame,
            textvariable=self.download_path,
            height=45,
            font=ctk.CTkFont(size=12),
            corner_radius=12,
            border_width=0,
            fg_color=("gray95", "gray20"),
            state="readonly"
        )
        self.path_entry.grid(row=0, column=0, sticky="ew", padx=(0, 10))
        
        browse_btn = ctk.CTkButton(
            path_inner_frame,
            text="Browse",
            command=self.browse_folder,
            width=100,
            height=45,
            corner_radius=12,
            font=ctk.CTkFont(size=13, weight="bold"),
            fg_color=("gray75", "gray30"),
            hover_color=("gray65", "gray35")
        )
        browse_btn.grid(row=0, column=1)
        
        # Progress Section
        progress_frame = ctk.CTkFrame(
            main_container,
            fg_color=("gray90", "gray17"),
            corner_radius=20,
            border_width=2,
            border_color=("gray70", "gray25")
        )
        progress_frame.grid(row=2, column=0, sticky="ew", pady=(0, 20))
        progress_frame.grid_columnconfigure(0, weight=1)
        
        progress_label = ctk.CTkLabel(
            progress_frame,
            text="📊 Download Progress",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        )
        progress_label.grid(row=0, column=0, sticky="w", padx=25, pady=(20, 10))
        
        self.progress_bar = ctk.CTkProgressBar(
            progress_frame,
            height=20,
            corner_radius=10,
            progress_color=("#3a9bff", "#1f538d")
        )
        self.progress_bar.grid(row=1, column=0, sticky="ew", padx=25, pady=(0, 10))
        self.progress_bar.set(0)
        
        self.status_label = ctk.CTkLabel(
            progress_frame,
            text="Ready to download",
            font=ctk.CTkFont(size=12),
            text_color=("gray50", "gray60"),
            anchor="w"
        )
        self.status_label.grid(row=2, column=0, sticky="w", padx=25, pady=(0, 20))
        
        # Download Button
        self.download_btn = ctk.CTkButton(
            main_container,
            text="⬇️  START DOWNLOAD",
            command=self.start_download,
            height=60,
            corner_radius=15,
            font=ctk.CTkFont(size=16, weight="bold"),
            fg_color=("#3a9bff", "#1f538d"),
            hover_color=("#5eb3ff", "#2d6bb5")
        )
        self.download_btn.grid(row=3, column=0, sticky="ew", pady=(0, 0))
        
    def create_footer(self):
        """Create footer"""
        footer_frame = ctk.CTkFrame(
            self,
            fg_color="transparent",
            height=40
        )
        footer_frame.grid(row=2, column=0, sticky="ew", padx=30, pady=(0, 20))
        
        footer_label = ctk.CTkLabel(
            footer_frame,
            text="Built with ❤️ by L1ght • 2025",
            font=ctk.CTkFont(size=11),
            text_color=("gray50", "gray50")
        )
        footer_label.pack()
        
    def quality_changed(self, choice):
        """Handle quality selection change"""
        quality_map = {
            "🏆 Best Quality": "best",
            "📺 720p HD": "720p",
            "📱 480p SD": "480p",
            "🎵 Audio Only": "audio"
        }
        self.quality_var.set(quality_map.get(choice, "best"))
        
    def browse_folder(self):
        """Open folder browser"""
        folder = filedialog.askdirectory(initialdir=self.download_path.get())
        if folder:
            self.download_path.set(folder)
            
    def update_status(self, message, progress=None):
        """Update status label and progress bar"""
        self.status_label.configure(text=message)
        if progress is not None:
            self.progress_bar.set(progress)
            
    def check_progress_queue(self):
        """Check for progress updates from download thread"""
        try:
            while True:
                message = self.progress_queue.get_nowait()
                
                if message.startswith("PROGRESS:"):
                    # Parse progress percentage
                    try:
                        percent_str = message.split(":")[1].strip()
                        percent = float(re.search(r'(\d+\.?\d*)%', percent_str).group(1))
                        self.progress_bar.set(percent / 100)
                        self.status_label.configure(text=percent_str)
                    except:
                        self.status_label.configure(text=message.replace("PROGRESS:", ""))
                        
                elif message.startswith("STATUS:"):
                    status = message.replace("STATUS:", "").strip()
                    self.status_label.configure(text=status)
                    
                elif message == "COMPLETE":
                    self.progress_bar.set(1.0)
                    self.status_label.configure(text="✅ Download completed successfully!")
                    self.download_btn.configure(state="normal", text="⬇️  START DOWNLOAD")
                    self.is_downloading = False
                    messagebox.showinfo("Success", f"Video downloaded successfully!\nSaved to: {self.download_path.get()}")
                    
                elif message.startswith("ERROR:"):
                    error = message.replace("ERROR:", "").strip()
                    self.status_label.configure(text=f"❌ Error: {error}")
                    self.download_btn.configure(state="normal", text="⬇️  START DOWNLOAD")
                    self.is_downloading = False
                    messagebox.showerror("Download Error", error)
                    
        except queue.Empty:
            pass
        
        # Schedule next check
        self.after(100, self.check_progress_queue)
        
    def download_worker(self, url, output_path, quality):
        """Worker thread for downloading video"""
        try:
            # Get the script directory
            script_dir = os.path.dirname(os.path.abspath(__file__))
            main_script = os.path.join(script_dir, "main.py")
            
            # Prepare command
            cmd = [sys.executable, main_script, url, output_path, quality]
            
            # Run download process
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            # Read output line by line
            for line in process.stdout:
                line = line.strip()
                if line:
                    # Parse download progress
                    if "[download]" in line and "%" in line:
                        self.progress_queue.put(f"PROGRESS:{line}")
                    elif "Starting download" in line or "Title:" in line or "Duration:" in line:
                        self.progress_queue.put(f"STATUS:{line}")
                    elif "completed successfully" in line:
                        self.progress_queue.put(f"STATUS:{line}")
                    else:
                        print(line)  # Debug output
            
            # Wait for process to complete
            process.wait()
            
            if process.returncode == 0:
                self.progress_queue.put("COMPLETE")
            else:
                self.progress_queue.put("ERROR:Download failed. Please check the URL and try again.")
                
        except Exception as e:
            self.progress_queue.put(f"ERROR:{str(e)}")
            
    def start_download(self):
        """Start download process"""
        if self.is_downloading:
            return
        
        url = self.url_var.get().strip()
        if not url:
            messagebox.showwarning("Invalid Input", "Please enter a YouTube URL")
            return
        
        if not url.startswith(("http://", "https://")):
            messagebox.showwarning("Invalid URL", "Please enter a valid YouTube URL")
            return
        
        # Update UI
        self.is_downloading = True
        self.download_btn.configure(state="disabled", text="⏳ DOWNLOADING...")
        self.progress_bar.set(0)
        self.status_label.configure(text="Initializing download...")
        
        # Start download in separate thread
        download_thread = threading.Thread(
            target=self.download_worker,
            args=(url, self.download_path.get(), self.quality_var.get()),
            daemon=True
        )
        download_thread.start()

def main():
    """Main entry point"""
    app = ModernYouTubeDownloader()
    app.mainloop()

if __name__ == "__main__":
    main()
