# Integration Specifications: GLVT Landing Page <-> Hotel App

## Overview
The GLVT Landing Page (`GLVT-WEB`) redirects authenticated members to the Hotel Application (`exequte-hotel-1`).
To ensure seamless user experience and proper analytics, `GLVT-WEB` will append a source identifier to the redirection URL.

## Connection Protocol

### Incoming URL Pattern
When a user logs in via the GLVT Landing Page, they will be redirected to the following URL structure:

```
https://[hotel-app-domain]/glvt/launch?source=glvt_landing
```

### Parameters
| Parameter | Value | Description |
| :--- | :--- | :--- |
| `source` | `glvt_landing` | Indicates the user originated from the GLVT Landing Page login flow. |

## Recommended Handling (Hotel App Side)

1.  **Session Context**: Store the `source=glvt_landing` value in the user's session storage.
2.  **Navigation**:
    *   If `source` is present, the "Home" or "Back" button in the Hotel App's top navigation could optionally link back to the GLVT Landing Page (`/`) instead of the Hotel App root.
3.  **Analytics**: Use this parameter to segment traffic and measure conversion from the marketing site.

## Example Implementation (JS)
```javascript
const urlParams = new URLSearchParams(window.location.search);
const source = urlParams.get('source');

if (source === 'glvt_landing') {
  console.log("Welcome GLVT Member!");
  // Set app context or UI theme accordingly
}
```
