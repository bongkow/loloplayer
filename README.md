# HLS Maker

A cross-platform desktop video player built with Tauri v2, React, and TypeScript. Features native video playback with libmpv and HLS (HTTP Live Streaming) generation capabilities.

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| Windows  | ✅ Fully Supported | All dependencies bundled |
| Linux    | ✅ Supported | Requires system libmpv installation |
| macOS    | ✅ Supported | Requires Homebrew for libmpv |

## Prerequisites

### All Platforms
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Yarn](https://yarnpkg.com/) package manager
- [Rust](https://rustup.rs/) (latest stable)

### Platform-Specific Requirements

#### Windows
- ✅ All binaries included (no additional setup required)

#### Linux
- **libmpv**: Install via package manager
  ```bash
  # Ubuntu/Debian
  sudo apt install libmpv-dev
  
  # Fedora
  sudo dnf install mpv-libs-devel
  
  # Arch
  sudo pacman -S mpv
  ```
- **FFmpeg binary**: See [PLATFORM_SETUP.md](PLATFORM_SETUP.md) for instructions

#### macOS
- **libmpv**: Install via Homebrew
  ```bash
  brew install mpv
  ```
- **FFmpeg binary**: See [PLATFORM_SETUP.md](PLATFORM_SETUP.md) for instructions

## Quick Start

```bash
# Install dependencies
yarn install

# Run in development mode
yarn tauri dev

# Build for production
yarn tauri build
```

## Detailed Setup

For detailed platform-specific setup instructions, including how to obtain and configure FFmpeg binaries for Linux and macOS, please see [PLATFORM_SETUP.md](PLATFORM_SETUP.md).

## Application Modes

### 🎥 Player
Experience native performance powered by **libmpv**.
- **Universal Format Support**: Plays MP4, MKV, AVI, HEVC, and more.
- **Smart Resume**: Remembers where you left off. History resets automatically when you finish a video.
- **Always On Top**: Keep the player visible while working.
- **Classic Experience**: A fast, lightweight, and distraction-free interface.

### ✂️ Cutter
Extract highlights instantly without quality loss.
- **Lossless Export**: Cuts video segments using **Stream Copy** mode (no re-encoding).
- **Easy Controls**: Set Start and End points with a single click.
- **Smart Naming**: Automatically organizes outputs with timestamps and `[cut]` prefixes.

### � Converter (In Development)
Values stability and simplicity for HLS creation.
- **HLS Generation**: Convert local videos into HTTP Live Streaming compatible playlists.

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Tauri v2, Rust
- **Video Player**: libmpv
- **Video Processing**: FFmpeg
- **Streaming**: HLS.js

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
