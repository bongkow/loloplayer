# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Multi-platform support for Linux and macOS
- Platform-specific setup documentation (PLATFORM_SETUP.md)
- GitHub Actions workflow for automated multi-platform builds
- FFmpeg binary configuration for cross-platform builds

### Changed
- Updated README with platform compatibility information
- Added .gitignore rules for platform-specific binaries

### Documentation
- Comprehensive platform setup guide with prerequisite instructions
- libmpv installation instructions for Linux and macOS
- FFmpeg binary download and configuration guide


## [0.2.0] - 2025-12-17

### Added
- Native mpv player integration for instant video playback
- Hardware-accelerated HEVC/H.265 playback support (NVIDIA GPU)
- Universal video format support (MP4, MKV, AVI, WebM, etc.)
- Transparent window rendering for mpv video embedding

### Changed
- Replaced HTML5 video player with libmpv
- Removed HEVC transcoding logic (no longer needed)
- Updated UI with dynamic transparency when playing videos

### Improved
- Instant playback - no waiting for transcoding
- GPU-accelerated decoding (hwdec: auto-safe)

## [0.1.0] - 2025-12-16

### Added
- Initial release with HLS conversion features
- VLC-style UI with dark theme
- Video auto-play on load
- Custom title bar with window controls
- FFmpeg-based HLS conversion
