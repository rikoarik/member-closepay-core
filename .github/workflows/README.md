# CI/CD Workflows

Dokumentasi untuk GitHub Actions workflows yang digunakan dalam project ini.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Workflow ini dijalankan pada:
- Pull Request ke branch `main`
- Push ke semua branch

**Jobs:**
- **test-lint**: Menjalankan test dengan coverage dan linting
- **build-android**: Build Android APK (debug & release)

**Artifacts:**
- Android Debug APK
- Android Release APK

### 2. Release Workflow (`.github/workflows/release.yml`)

Workflow ini dijalankan pada:
- Push tag dengan format `v*` (contoh: `v1.0.0`)
- Push ke branch `main`
- Manual trigger via workflow_dispatch

**Jobs:**
- **build-android-release**: Build Android Release APK
- **create-release**: Membuat GitHub Release dan upload APK

## Setup

### Prerequisites

1. **Node.js**: Versi 20 atau lebih tinggi
2. **Android SDK**: Otomatis diinstall oleh GitHub Actions
3. **Java**: Versi 17 (Temurin)

## Usage

### Manual Release

1. Buka tab "Actions" di GitHub
2. Pilih workflow "Release"
3. Klik "Run workflow"
4. Masukkan version tag (contoh: `v1.0.0`)
5. Klik "Run workflow"

### Tag Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

Workflow akan otomatis membuat release dengan tag tersebut.

## Artifacts

Artifacts dari build dapat di-download dari:
- **CI Workflow**: Tab "Actions" → Pilih workflow run → Scroll ke "Artifacts"
- **Release**: Tab "Releases" → Pilih release → Download files

## Troubleshooting

### Android Build Fails

- Pastikan `debug.keystore` ada di `android/app/`
- Check Gradle version compatibility
- Verify Android SDK setup
- Pastikan Java 17 terinstall

### Test Coverage Fails

- Coverage threshold: 80% (dapat diubah di `jest.config.js`)
- Pastikan semua test files mengikuti pattern `*.test.{ts,tsx}`

