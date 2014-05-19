---
title: Installation
template: page.ejs
---

Installation
============

You have a few options when it comes to installing Fluxxor. Keep in mind that, while Fluxxor works great with [React](http://facebook.github.io/react/), React is not required for Fluxxor.

CommonJS Module Bundlers
------------------------

Fluxxor is distributed [on npm](https://www.npmjs.org/package/fluxxor). You can install it with

`npm install [--save] fluxxor`

If you're using a client-side module bundler like [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/), you're done! Simply `require("fluxxor")` to get a reference to the library.

Browser Builds
--------------

Browser builds and corresponding source map files can be found on [the Fluxxor releases page](https://github.com/BinaryMuse/fluxxor/releases). Browser builds use a universal module definition, and should work in the following environments:

### CommonJS

```javascript
var Fluxxor = require("path/to/fluxxor");
```

### AMD

```javascript
define("someModule", ["Fluxxor"], function(Fluxxor) {
  // ...
});
```

### Standalone

```html
<script src="path/to/fluxxor.js"></script>
```

```javascript
window.Fluxxor.createStore({ ... });
```

Getting Started
---------------

Check out [the quick-start guide](/getting-started/quick-start.html) to get up-to-speed building apps with Fluxxor in no time.
