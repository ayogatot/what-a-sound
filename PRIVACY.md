# Privacy Policy for What a Sound

**Last Updated:** March 14, 2026

## Data Collection

What a Sound does **NOT** collect, transmit, or share any personal data. All settings and audio preferences are stored locally on your device using Chrome's built-in storage API.

## What Data is Stored

The extension stores the following data **locally on your device only**:

- Your preferences for which sounds to play for Copy (Ctrl+C), Paste (Ctrl+V), and Text Selection.
- Whether the extension's sound effects are enabled or disabled.

## Data Storage

- All data is stored using `chrome.storage.sync` API to sync across your signed-in browsers.
- Data never leaves your browser directly from us.
- No analytics, tracking, or telemetry is implemented.
- No external servers are contacted.
- No cookies are used.

## Permissions Used

The extension requests the following permissions:

- **activeTab**: To access the currently active webpage when you interact with the extension.
- **storage**: To save your sound preferences.
- **host permissions (<all_urls>)**: To allow the content script to listen for keyboard (copy/paste) and mouse (text selection) events on any website you visit in order to play the respective sounds.

These permissions are used **only** for the core functionality of playing your configured sounds upon interaction.

## Third-Party Services

What a Sound does **NOT** use any third-party services, analytics, or tracking tools.

## Data Deletion

You can delete all stored data at any time by removing the extension entirely from Chrome, which clears the extension's storage.

## Changes to This Policy

Any changes to this privacy policy will be updated in this document and in the extension listing.

## Contact

For questions or concerns about privacy, please contact [@ayogatot](https://github.com/ayogatot).
