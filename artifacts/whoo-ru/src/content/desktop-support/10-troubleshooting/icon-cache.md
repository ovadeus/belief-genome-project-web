# Icon cache and Finder issues

If the BGP Mission Control icon shows up as a generic dark window
in Finder list view, the app switcher, or Spotlight — it's almost
always a **macOS icon cache issue**, not a problem with the app
itself.

## Why this happens

macOS aggressively caches app icons by bundle ID. When an app's
icon assets change (e.g. you install a new build), the cache may
not pick up the new icon for hours or even days, depending on
which surfaces you've touched recently.

In the rare case the cache is **never** picking up the new icon,
it's likely the `.icns` file inside the app bundle is missing
some sizes — older builds of BGP Mission Control had this issue;
v0.1.0+ ships a complete `.icns` with all 10 size variants, which
fixes the root cause.

## Fix the immediate symptom

1. **Quit the app:** ⌘Q
2. **Touch the bundle to invalidate macOS's icon cache for it:**
   ```sh
   touch "/Applications/BGP Mission Control.app"
   ```
3. **Restart Finder:**
   ```sh
   killall Finder
   ```
4. **Restart Dock** (in case the dock or Launchpad icon is also
   stale):
   ```sh
   killall Dock
   ```
5. Relaunch the app.

If still stale: log out / back in, or reboot. macOS rebuilds the
icon cache on login.

## Nuclear option

If the icon is stuck across multiple reboots:

```sh
sudo rm -rfv /Library/Caches/com.apple.iconservices.store
sudo find /private/var/folders/ -name com.apple.dock.iconcache -exec rm {} \;
killall Dock
killall Finder
```

This wipes the system-wide icon cache and forces every app's
icon to re-render from its bundle on next access. Harmless but
will cause a brief icon-flash across all apps as they
re-cache.

## Verify the bundle has the right icon

```sh
ls -la "/Applications/BGP Mission Control.app/Contents/Resources/icon.icns"
defaults read "/Applications/BGP Mission Control.app/Contents/Info.plist" CFBundleIconFile
```

The first should show a non-zero file size (~50KB for the v0.1.0+
complete iconset). The second should print `icon.icns`.

You can also extract and inspect the iconset:

```sh
iconutil -c iconset \
  "/Applications/BGP Mission Control.app/Contents/Resources/icon.icns" \
  -o /tmp/bgp-icon.iconset
ls /tmp/bgp-icon.iconset/
```

A complete iconset has 10 files: every combination of {16, 32,
128, 256, 512} × {1x, @2x}. Earlier builds were missing
`icon_16x16.png` and `icon_32x32.png` — exactly the sizes macOS
uses for Finder list view, app switcher, and Spotlight. v0.1.0+
includes all 10.

## Windows and Linux

Windows uses its own icon cache (`iconcache.db` in
`%LOCALAPPDATA%`). Symptoms and fixes are similar; restart
Explorer or run `ie4uinit.exe -ClearIconCache` from a terminal.

Linux desktop environments vary — GNOME, KDE, and others each
maintain their own icon caches. Logging out / back in usually
suffices.

## When it's not the icon cache

If the icon is missing in the app's own window (e.g. the title
bar shows no icon, or the dock icon is blank even after a clean
reinstall), the bundle itself is incomplete. This shouldn't
happen with releases from the official downloads page — file an
issue with the build version and we'll investigate.
