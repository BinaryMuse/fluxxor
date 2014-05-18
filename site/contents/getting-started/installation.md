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

Browser Builds
--------------

Browser builds and corresponding source map files can be found on [the Fluxbox releases page](https://github.com/BinaryMuse/fluxbox/releases). Browser builds use a universal module definition, and should work in the following environments:

### CommonJS

```javascript
var Fluxbox = require("path/to/fluxbox");
```

### AMD

```javascript
define("someModule", ["Fluxbox"], function(Fluxbox) {
  // ...
});
```

### Standalone

```html
<script src="path/to/fluxbox.js"></script>
```

```javascript
window.Fluxbox.createStore({ ... });
```

Getting Started
---------------

Check out [the quick-start guide](/getting-started/quick-start.html) to get up-to-speed building apps with Fluxbox in no time.
