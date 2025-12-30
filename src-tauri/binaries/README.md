# Instructions for Adding Platform-Specific FFmpeg Binaries

This directory should contain FFmpeg binaries for each target platform. The binaries are **NOT** included in the repository due to their large size.

## Required Files

You need to add the following platform-specific FFmpeg binaries:

### Linux
- **File**: `ffmpeg-x86_64-unknown-linux-gnu`
- **Download**: https://johnvansickle.com/ffmpeg/
- **Instructions**: Download the latest 64-bit static build, extract it, and rename the `ffmpeg` binary to `ffmpeg-x86_64-unknown-linux-gnu`

### macOS (Intel)
- **File**: `ffmpeg-x86_64-apple-darwin`
- **Download**: https://evermeet.cx/ffmpeg/
- **Instructions**: Download the latest ffmpeg for Intel Macs and rename to `ffmpeg-x86_64-apple-darwin`

### macOS (Apple Silicon)
- **File**: `ffmpeg-aarch64-apple-darwin`
- **Download**: https://evermeet.cx/ffmpeg/
- **Instructions**: Download the ARM64 version for M1/M2/M3 Macs and rename to `ffmpeg-aarch64-apple-darwin`

### Windows (Already Included)
- **File**: `ffmpeg-x86_64-pc-windows-msvc.exe`
- ✅ Already in the repository

## Making Binaries Executable (Linux/macOS)

After downloading, make the binaries executable:

```bash
chmod +x ffmpeg-x86_64-unknown-linux-gnu
chmod +x ffmpeg-x86_64-apple-darwin
chmod +x ffmpeg-aarch64-apple-darwin
```

## Verification

After adding all binaries, this directory should contain:

```
binaries/
├── ffmpeg-x86_64-pc-windows-msvc.exe       (Windows)
├── ffmpeg-x86_64-unknown-linux-gnu         (Linux)
├── ffmpeg-x86_64-apple-darwin              (macOS Intel)
└── ffmpeg-aarch64-apple-darwin             (macOS Apple Silicon)
```

## Alternative: Using GitHub Actions

If you don't want to manually download these binaries, the included GitHub Actions workflow (`.github/workflows/build-multi-platform.yml`) will automatically download and bundle the correct FFmpeg binary for each platform during CI/CD builds.
