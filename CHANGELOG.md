# Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.2-beta.2](https://github.com/jabrown93/homebridge-philips-hue-sync-box/compare/v1.0.2-beta.1...v1.0.2-beta.2) (2025-01-14)

### Bug Fixes

* retry failed requests and better error handling ([146fcd9](https://github.com/jabrown93/homebridge-philips-hue-sync-box/commit/146fcd9c2dbb22954bd3fcd7e175c2630f3bd39e))

## [1.0.2-beta.1](https://github.com/jabrown93/homebridge-philips-hue-sync-box/compare/v1.0.1...v1.0.2-beta.1) (2025-01-14)

### Bug Fixes

* use proper power characteristic when updating ([8e5b254](https://github.com/jabrown93/homebridge-philips-hue-sync-box/commit/8e5b25495abcfc2325ecf6a4f86cb62b14d7b46c))

## [1.0.1](https://github.com/jabrown93/homebridge-philips-hue-sync-box/compare/v1.0.0...v1.0.1) (2025-01-14)

### Bug Fixes

* add keep-alive to HTTP requests ([#77](https://github.com/jabrown93/homebridge-philips-hue-sync-box/issues/77)) ([f344c44](https://github.com/jabrown93/homebridge-philips-hue-sync-box/commit/f344c441dcd000bf56eb12cfd9d88b71a586236c))
* ensure updateIntervalInSeconds always defaults to 5 ([7f367a6](https://github.com/jabrown93/homebridge-philips-hue-sync-box/commit/7f367a67bc57f99f79bfd193156f5ae8134ac892))
* set active identifier correctly from lookup map ([583187f](https://github.com/jabrown93/homebridge-philips-hue-sync-box/commit/583187f9964c0a32f3343a80fe2e4b8cfd11154f))

## [1.0.1-beta.3](https://github.com/jabrown93/homebridge-philips-hue-sync-box/compare/v1.0.1-beta.2...v1.0.1-beta.3) (2025-01-14)

### Bug Fixes

* set active identifier correctly from lookup map ([583187f](https://github.com/jabrown93/homebridge-philips-hue-sync-box/commit/583187f9964c0a32f3343a80fe2e4b8cfd11154f))

## [1.0.1-beta.2](https://github.com/jabrown93/homebridge-philips-hue-sync-box/compare/v1.0.1-beta.1...v1.0.1-beta.2) (2025-01-13)

### Bug Fixes

* ensure updateIntervalInSeconds always defaults to 5 ([7f367a6](https://github.com/jabrown93/homebridge-philips-hue-sync-box/commit/7f367a67bc57f99f79bfd193156f5ae8134ac892))

## [1.0.1-beta.1](https://github.com/jabrown93/homebridge-philips-hue-sync-box/compare/v1.0.0...v1.0.1-beta.1) (2025-01-13)

### Bug Fixes

* add keep-alive to HTTP requests ([#77](https://github.com/jabrown93/homebridge-philips-hue-sync-box/issues/77)) ([f344c44](https://github.com/jabrown93/homebridge-philips-hue-sync-box/commit/f344c441dcd000bf56eb12cfd9d88b71a586236c))

## 1.0.0 (2025-01-12)

### ⚠ BREAKING CHANGES

* isApiEnabled config renamed to apiServerEnabled
* apiPort config renamed to apiServerPort
* apiToken config renamed to apiServerToken
* updateInterval config renamed to updateIntervalInSeconds and unit changed form ms to seconds

### Features

* Show HDMI input names as configured in Hue Sync app instead of always HDMI 1-4 ([f2ecb16](https://github.com/jabrown93/homebridge-philips-hue-sync-box/commit/f2ecb164d8f33f7aed43bc378f2e9484301bcd38))
* typescript rewrite ([#74](https://github.com/jabrown93/homebridge-philips-hue-sync-box/issues/74)) ([ed9c4df](https://github.com/jabrown93/homebridge-philips-hue-sync-box/commit/ed9c4dfd1bf637335d9a5802445fca48d9d3d15f))
