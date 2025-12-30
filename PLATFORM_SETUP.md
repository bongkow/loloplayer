# Platform-Specific Setup Guide

This guide provides detailed instructions for setting up HLS Maker on different operating systems.

## Table of Contents
- [Windows Setup](#windows-setup)
- [Linux Setup](#linux-setup)
- [macOS Setup](#macos-setup)
- [Troubleshooting](#troubleshooting)

---

## Windows Setup

### Prerequisites

1. **libmpv Library** (Already included in `src-tauri/lib/`)
   - `libmpv-2.dll` and `libmpv-wrapper.dll` are bundled with the project
   - No additional installation required

2. **FFmpeg Binary** (Already included in `src-tauri/binaries/`)
   - `ffmpeg-x86_64-pc-windows-msvc.exe` is bundled
   - No additional installation required

### Build & Run

```powershell
# Install dependencies
yarn install

# Run in development mode
yarn tauri dev

# Build for production
yarn tauri build
```

---

## Linux Setup

### Prerequisites

#### 1. Install libmpv

The libmpv library must be installed system-wide:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install libmpv-dev
```

**Fedora:**
```bash
sudo dnf install mpv-libs-devel
```

**Arch Linux:**
```bash
sudo pacman -S mpv
```

**Other Distributions:**
Search for `libmpv` or `mpv-devel` in your package manager.

#### 2. Add FFmpeg Binary

Download a static FFmpeg binary for Linux and add it to your project:

1. **Download FFmpeg:**
   - Visit: https://johnvansickle.com/ffmpeg/
   - Download the latest **64-bit static build**
   - Extract the archive

2. **Rename and Move:**
   ```bash
   # Extract the downloaded archive
   tar xf ffmpeg-release-amd64-static.tar.xz
   
   # Navigate to the extracted folder
   cd ffmpeg-*-amd64-static
   
   # Copy and rename to your project
   cp ffmpeg /path/to/hlsMaker/src-tauri/binaries/ffmpeg-x86_64-unknown-linux-gnu
   
   # Make it executable
   chmod +x /path/to/hlsMaker/src-tauri/binaries/ffmpeg-x86_64-unknown-linux-gnu
   ```

3. **Verify the file is in the correct location:**
   ```
   src-tauri/binaries/
   ├── ffmpeg-x86_64-pc-windows-msvc.exe
   └── ffmpeg-x86_64-unknown-linux-gnu  ← This file
   ```

### Build & Run

```bash
# Install dependencies
yarn install

# Run in development mode
yarn tauri dev

# Build for production
yarn tauri build
```

The built application will be in `src-tauri/target/release/bundle/`.

---

## macOS Setup

### Prerequisites

#### 1. Install libmpv

Using Homebrew (recommended):

```bash
# Install Homebrew if you haven't already
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install mpv (includes libmpv)
brew install mpv
```

#### 2. Add FFmpeg Binary

Download FFmpeg for macOS and add it to your project:

1. **Download FFmpeg:**
   
   **Option A: Using Homebrew (for building only):**
   ```bash
   brew install ffmpeg
   # Note: This installs system-wide but won't bundle with your app
   ```
   
   **Option B: Download Static Binary (recommended for bundling):**
   - Visit: https://evermeet.cx/ffmpeg/
   - Download the latest **ffmpeg** (not ffprobe or ffplay)
   - Extract the `.7z` or `.zip` file

2. **Rename and Move:**
   ```bash
   # If using Option B, copy and rename
   cp /path/to/downloaded/ffmpeg /path/to/hlsMaker/src-tauri/binaries/ffmpeg-x86_64-apple-darwin
   
   # Make it executable
   chmod +x /path/to/hlsMaker/src-tauri/binaries/ffmpeg-x86_64-apple-darwin
   ```

3. **Verify the file is in the correct location:**
   ```
   src-tauri/binaries/
   ├── ffmpeg-x86_64-pc-windows-msvc.exe
   ├── ffmpeg-x86_64-unknown-linux-gnu
   └── ffmpeg-x86_64-apple-darwin  ← This file
   ```

### Build & Run

```bash
# Install dependencies
yarn install

# Run in development mode
yarn tauri dev

# Build for production
yarn tauri build
```

The built application will be in `src-tauri/target/release/bundle/`.

---

## Troubleshooting

### Linux Issues

**Error: "libmpv.so not found"**
- **Solution:** Install libmpv using your package manager (see [Linux Prerequisites](#1-install-libmpv))
- **Verify installation:** `ldconfig -p | grep libmpv`

**Error: "ffmpeg not found" or "Permission denied"**
- **Solution:** Ensure the FFmpeg binary is executable:
  ```bash
  chmod +x src-tauri/binaries/ffmpeg-x86_64-unknown-linux-gnu
  ```

**Error: "cannot execute binary file: Exec format error"**
- **Solution:** You may have downloaded the wrong architecture. Ensure you downloaded the x86_64 version for 64-bit systems.

### macOS Issues

**Error: "libmpv.dylib not found"**
- **Solution:** Install mpv via Homebrew: `brew install mpv`
- **Verify installation:** `brew list mpv`

**Error: "ffmpeg cannot be opened because the developer cannot be verified"**
- **Solution:** Remove the quarantine attribute:
  ```bash
  xattr -d com.apple.quarantine src-tauri/binaries/ffmpeg-x86_64-apple-darwin
  ```

**Error: Building for Apple Silicon (M1/M2/M3)**
- **Note:** You'll need an ARM64 FFmpeg binary: `ffmpeg-aarch64-apple-darwin`
- Download from: https://evermeet.cx/ffmpeg/ (ARM64 version)

### Windows Issues

**Error: "libmpv-2.dll not found"**
- **Solution:** Ensure `src-tauri/lib/libmpv-2.dll` and `src-tauri/lib/libmpv-wrapper.dll` exist
- These should be included in the repository

### General Build Issues

**Rust compilation errors:**
- Ensure you have the latest Rust toolchain: `rustup update`
- Clean build cache: `yarn tauri build --clean`

**Node/Yarn issues:**
- Clear node_modules: `rm -rf node_modules && yarn install`
- Ensure you're using a compatible Node version (16+)

---

## Building for Multiple Platforms

To build for multiple platforms from a single machine, you can use CI/CD or cross-compilation:

### Using GitHub Actions (Recommended)

Create a workflow that builds on multiple runners:
- `ubuntu-latest` for Linux builds
- `macos-latest` for macOS builds  
- `windows-latest` for Windows builds

### Cross-Compilation (Advanced)

Tauri supports cross-compilation, but it's complex and may require additional setup. Refer to the [Tauri documentation](https://tauri.app/v1/guides/building/cross-platform) for details.

---

## Additional Resources

- [Tauri Documentation](https://tauri.app/)
- [FFmpeg Downloads](https://ffmpeg.org/download.html)
- [libmpv Documentation](https://mpv.io/manual/master/#embedding-into-other-programs-libmpv)
