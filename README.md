# rememberingstateoffline
Uses a service worker to cache my web app

In this assignment, you’ll take an existing website you’ve made and make it both installable and work offline! You’ll expand your current Vite build system to be able to compile your service worker. Doing this is the start of turning your site into a Progressive Web App, or a PWA, a great way to deliver your work without needing to build separate apps for each device.

To complete the assignment, please do the following:
Create a branch from week 7’s assignment for this week’s work
Install Vite Plugin PWA and configure it to use injectManifest
Set strategies to injectManifest
Set injectManifest to an object, with a globPatterns key whose value ['**/*.html'] (to capture only HTML files)
Create a Service Worker that:
Precaches your HTML
Provide an offline fallback using Workbox Recipes’ offline fallback recipe. Make sure you create a separate offline page!
Cache CSS and JavaScript using Workbox Recipes’ static resources cache recipe
Cache images using Workbox Recipes’ image cache recipe
Prompts the user to reload their page on new content.

onNeedRefersh and onOfflineReady from the Vite Plugin PWA docs are functions you need to define. Make sure you display the appropriate buttons, and make them do the appropriate things, inside those function definitions; the buttons and functionality aren’t automatically handled.
