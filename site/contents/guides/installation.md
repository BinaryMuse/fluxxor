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

Browser builds and corresponding source map files can be downloaded from [the Fluxxor releases page](https://github.com/BinaryMuse/fluxxor/releases) or installed via [Bower](http://bower.io/) via `bower install fluxxor`. Browser builds use a universal module definition, and should work in the following environments:

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

WebJar releases
---------------

For JVM languages, there's also [WebJar](http://www.webjars.org) packages available on Maven Central and jsDelivr as the following:

SBT / Play framework 2:
```scala
"org.webjars" % "fluxxor" % fluxxorVersion
```

Maven:
```xml
<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>fluxxor</artifactId>
    <version>${fluxxor.version}</version>
</dependency>
```

For detailed instructions, refer to the [WebJars documentation](http://www.webjars.org/documentation).

__NOTE__: WebJar packages are not maintained by the author himself, so that the latest WebJar might be slightly outdated to the official release. To keep it up-to-date, you can open a pull request on [Fluxxor WebJar repository on Github](https://github.com/webjars/fluxxor).

Browser Compatibility
---------------------

Fluxxor is compatible with any [ES5-compliant browser](http://kangax.github.io/compat-table/es5/) (IE 9+, FF 4+, Safari 5.1.4+, Chrome 19+, Opera 12.10+). You can use [es5-shim](https://github.com/es-shims/es5-shim) for other browsers.

Getting Started
---------------

Check out [the quick-start guide](/guides/quick-start.html) to get up-to-speed building apps with Fluxxor in no time.
