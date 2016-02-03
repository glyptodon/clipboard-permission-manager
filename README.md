**WARNING:** This extension is currently in the early development stages and
does not yet have a functional permission management system. In its current
state, *the extension will allow clipboard access universally and without
prompting*. It is not recommended that this extension be used until it is
actually completed and released.

Clipboard Permission Manager
============================

Clipboard Permission Manager is a browser extension which allows users to grant
JavaScript access to the clipboard on a per-page basis. This access is given
through the standard `document.execCommand()` function, but such access will
not require a corresponding user event like a click or keypress if explicit
permission is granted using this extension.

This extension is a work-in-progress and is currently implemented for Chrome. A
Firefox version is planned.

Background
----------

Clipboard access is provided by most mainstream browsers through the "cut",
"copy", and "paste" commands given to `document.execCommand()`, as defined by
the [W3C "Clipboard API and events" working
draft](https://www.w3.org/TR/clipboard-apis/). It is up to the browser to
decide exactly how to restrict access to the clipboard. Unfortunately, both
Chrome and Firefox restrict clipboard access by only handling these commands in
very specific cases which require user interaction, and do not provide a
mechanism for granting access an a per-page basis such that user interaction is
not required going forward.

This extension is intended to provide such a mechanism, and it is our hope that
browsers will provide such a mechanism on their own in the future, rendering
this extension unnecessary.

