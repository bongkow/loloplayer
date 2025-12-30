#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const files = {
    packageJson: path.join(rootDir, 'package.json'),
    tauriConf: path.join(rootDir, 'src-tauri', 'tauri.conf.json'),
    cargoToml: path.join(rootDir, 'src-tauri', 'Cargo.toml'),
};

function getCurrentVersion() {
    const pkg = JSON.parse(fs.readFileSync(files.packageJson, 'utf8'));
    return pkg.version;
}

function bumpVersion(currentVersion, type) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (type) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        default:
            // Assume it's an exact version string
            if (/^\d+\.\d+\.\d+$/.test(type)) {
                return type;
            }
            throw new Error(`Invalid version type: ${type}. Use 'major', 'minor', 'patch', or a version string like '1.2.3'`);
    }
}

function updatePackageJson(newVersion) {
    const content = JSON.parse(fs.readFileSync(files.packageJson, 'utf8'));
    content.version = newVersion;
    fs.writeFileSync(files.packageJson, JSON.stringify(content, null, 2) + '\n');
    console.log(`✓ Updated package.json to ${newVersion}`);
}

function updateTauriConf(newVersion) {
    const content = JSON.parse(fs.readFileSync(files.tauriConf, 'utf8'));
    content.version = newVersion;
    fs.writeFileSync(files.tauriConf, JSON.stringify(content, null, 2) + '\n');
    console.log(`✓ Updated tauri.conf.json to ${newVersion}`);
}

function updateCargoToml(newVersion) {
    let content = fs.readFileSync(files.cargoToml, 'utf8');
    content = content.replace(/^version = ".*"$/m, `version = "${newVersion}"`);
    fs.writeFileSync(files.cargoToml, content);
    console.log(`✓ Updated Cargo.toml to ${newVersion}`);
}

function main() {
    const type = process.argv[2];

    if (!type) {
        console.log('Usage: node bump-version.js <patch|minor|major|x.y.z>');
        console.log('');
        console.log('Examples:');
        console.log('  node bump-version.js patch   # 0.1.0 → 0.1.1');
        console.log('  node bump-version.js minor   # 0.1.0 → 0.2.0');
        console.log('  node bump-version.js major   # 0.1.0 → 1.0.0');
        console.log('  node bump-version.js 1.2.3   # Set exact version');
        process.exit(1);
    }

    const currentVersion = getCurrentVersion();
    console.log(`Current version: ${currentVersion}`);

    const newVersion = bumpVersion(currentVersion, type);
    console.log(`New version: ${newVersion}`);
    console.log('');

    updatePackageJson(newVersion);
    updateTauriConf(newVersion);
    updateCargoToml(newVersion);

    console.log('');
    console.log(`✅ Successfully bumped version to ${newVersion}`);
}

main();
