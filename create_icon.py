from PIL import Image, ImageDraw
import os

# Create icons directory
icons_dir = "ui/src-tauri/icons"
os.makedirs(icons_dir, exist_ok=True)

# Create a simple gradient icon
sizes = [(32, 32), (128, 128), (256, 256)]

for size in sizes:
    # Create image with gradient
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw gradient circle
    for i in range(size[0]):
        color_val = int(100 + (i / size[0]) * 155)
        draw.ellipse([i//4, i//4, size[0]-i//4, size[1]-i//4], 
                     fill=(103, 126, 234, 255))
    
    # Draw download arrow
    arrow_size = size[0] // 3
    center = size[0] // 2
    
    # Simple arrow shape
    arrow = [
        (center, center - arrow_size//2),
        (center, center + arrow_size//2),
    ]
    
    draw.line(arrow, fill=(255, 255, 255, 255), width=max(3, size[0]//20))
    
    # Arrowhead
    head_size = arrow_size // 3
    draw.polygon([
        (center, center + arrow_size//2),
        (center - head_size, center + arrow_size//2 - head_size),
        (center + head_size, center + arrow_size//2 - head_size),
    ], fill=(255, 255, 255, 255))
    
    # Save PNG files
    if size == (32, 32):
        img.save(f"{icons_dir}/32x32.png")
    elif size == (128, 128):
        img.save(f"{icons_dir}/128x128.png")
        img.save(f"{icons_dir}/128x128@2x.png")
    elif size == (256, 256):
        img.save(f"{icons_dir}/icon.png")

# Create ICO file (Windows)
icon_img = Image.open(f"{icons_dir}/icon.png")
icon_img.save(f"{icons_dir}/icon.ico", sizes=[(32, 32), (64, 64), (128, 128), (256, 256)])

# For macOS, create a simple ICNS (or just use PNG)
# ICNS creation requires additional tools, so we'll skip for now
# Users can generate it later with: https://cloudconvert.com/png-to-icns
print("✅ Icons created successfully!")
print(f"📁 Location: {icons_dir}")
print("\nNote: For macOS builds, convert icon.png to icon.icns using:")
print("  https://cloudconvert.com/png-to-icns")
