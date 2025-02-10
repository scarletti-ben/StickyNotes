# StickyNotes (Lite Version)

## Overview
Project to create a simple StickyNotes app with persistent local storage.

Reduced functionality to reduce visual clutter and be fit for sharing, and altered cloud storage to be a simple share function via `One Time Link` (`OTL`).

# Features
- Notes are autosaved to `localstorage`
- Notes load from `localstorage` when page loads
- Notes can be manually saved to user device as `.json` file
- Notes can be loaded from `.json` file from user device
- New notes can be added
- Notes can be deleted
- All notes can be removed in a hard reset
- All notes can be shared via a `One Time Link` or `OTL`
    - Opening an `OTL` will load a copy of all notes to the new device
        - The two devices are not in sync with each other, and the `OTL` is deleted on use
- There is a setting called `Toggle Expanding Notes` which will make notes go near fullscreen when being edited
- User prompts are given for important actions

# Testing Locally
- The easiest method is to clone into this repository and run `python -m http.server`