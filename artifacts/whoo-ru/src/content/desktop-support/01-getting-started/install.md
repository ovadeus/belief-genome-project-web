# Installing BGP Mission Control

The desktop app is distributed as a standard installer for each platform.
Nothing in this section requires a developer environment — these are the
same steps any user would follow.

## macOS

1. Download `BGP Mission Control-0.1.0.dmg` from the Belief Genome Project
   downloads page (or the link your invitation email points to).
2. Double-click the DMG to mount it. A Finder window opens with the
   **BGP Mission Control** app icon and an arrow to your **Applications**
   folder.
3. Drag the app icon onto **Applications**.
4. Eject the DMG (right-click the disk icon on the desktop → Eject).
5. Open Launchpad or your Applications folder and click **BGP Mission
   Control**.

### First-launch security prompt

macOS will prompt:

> "BGP Mission Control" is an app downloaded from the internet. Are you
> sure you want to open it?

Click **Open**. This is Gatekeeper's standard warning for unsigned
distributions and only appears the first time. (If macOS instead says
"BGP Mission Control can't be opened because Apple cannot check it for
malicious software," right-click the app → **Open** → **Open** in the
dialog. After that the app will launch normally.)

### Apple Silicon vs Intel

Both architectures are supported:
- **Apple Silicon (M1/M2/M3/M4):** use `BGP Mission Control-0.1.0-arm64.dmg`
- **Intel:** use `BGP Mission Control-0.1.0.dmg`

If you're not sure, the Intel DMG runs on both — Rosetta translation
handles it transparently — but the arm64 build is faster and uses less
memory on Apple Silicon.

## Windows

1. Download `BGP Mission Control Setup 0.1.0.exe`.
2. Double-click. SmartScreen may say "Windows protected your PC." Click
   **More info** → **Run anyway**.
3. Choose an install location (default is `%LOCALAPPDATA%\Programs\BGP
   Mission Control`).
4. Tick "Create desktop shortcut" if you want one.
5. Finish.

The app appears in Start menu and (optionally) on your desktop.

## Linux

Distributed as an AppImage. No install step:

1. Download `BGP-Mission-Control-0.1.0.AppImage`.
2. Make it executable: `chmod +x BGP-Mission-Control-0.1.0.AppImage`
3. Double-click or run from a terminal.

## What gets installed where

The app is self-contained — uninstalling removes the binary cleanly. Your
**data** lives separately and survives uninstalls/reinstalls. See
[Where your data lives](../11-privacy-and-data/data-locations.md).

## Updating

The app does not currently auto-update. Re-download the latest installer
and re-run it; your local data, settings, and connected integrations
persist across upgrades.
