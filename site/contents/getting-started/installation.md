---
title: Installation
template: page.ejs
---

Installation
============

CommonJS Module Bundlers
------------------------

Fluxbox is distributed [on npm](https://www.npmjs.org/package/fluxbox). You can install it with

`npm install [--save] fluxbox`

If you're using a client-side module bundler like [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/), you're done! Simply `require("fluxbox")` to get a reference to the library.

Standalone Browser Builds
-------------------------

Standalone browser builds can be found on [the Fluxbox releases page](https://github.com/BinaryMuse/fluxbox/releases). Browser builds use a universal module definition, and should work in CommonJS and AMD environments, as well as environments that don't use a module loader (e.g. the library is exported to `window.Fluxbox`).

Getting Started
---------------

Check out [the quick-start guide](/getting-started/quick-start.html) to get started building apps with Fluxbox.
