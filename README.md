# Chrome extension: Fromat Title

This Chrome extension appends the hostname and pathname of the current URL to the original page title.

## How it works:

1. The extension runs in the background, monitoring tab updates.
2. When a page is fully loaded, it constructs a new title using the format:
   `[Original Title] - [hostname][pathname]`
3. The new title is then sent to the content script, which updates the page's title.
