<div align="center">
<img src="http://fluxxor.com/fluxxor.svg" height="350" alt="Fluxxor" title="Fluxxor">
</div>

Fluxxor is a set of tools to aid in developing
[React](http://facebook.github.io/react/) applications with the [Flux
architecture](http://facebook.github.io/react/docs/flux-overview.html).

[![Travis CI](https://api.travis-ci.org/BinaryMuse/fluxxor.svg?branch=master)](https://travis-ci.org/BinaryMuse/fluxxor)

[![NPM](https://nodei.co/npm/fluxxor.png?downloads=true)](https://nodei.co/npm/fluxxor/)

Installation
------------

Fluxxor is available on npm and works with module bundlers like
[Browserify](http://browserify.org/) and [Webpack](http://webpack.github.io/).

    npm install [--save] fluxxor

Standalone browser builds can be downloaded from
[the GitHub releases page](https://github.com/BinaryMuse/fluxxor/releases) or installed via
Bower:

    bower install fluxxor

More detailed installation instructions can be found on
[the Fluxxor website](http://fluxxor.com/guides/installation.html).

### Third Party Releases

The following releases are maintained by third parties, and support inquiries should be directed to their maintainers.

#### WebJar

For JVM languages, there are [WebJar](http://www.webjars.org) packages available on Maven Central and jsDelivr as the following:

SBT/Play Framework 2:

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

For detailed instructions, refer to the [WebJars documentation](http://www.webjars.org/documentation). For update requests, open a pull request on the [Fluxxor WebJar repository on Github](https://github.com/webjars/fluxxor).

Browser Compatibility
---------------------

Fluxxor is compatible with any [ES5-compliant browser](http://kangax.github.io/compat-table/es5/) (IE 9+, FF 4+, Safari 5.1.4+, Chrome 19+, Opera 12.10+). You can use [es5-shim](https://github.com/es-shims/es5-shim) for other browsers.


Documentation
-------------

See [the Fluxxor website](http://fluxxor.com) for in-depth
[documentation](http://fluxxor.com/documentation/),
[installation instructions](http://fluxxor.com/guides/installation.html),
[examples](http://fluxxor.com/examples/), and
[a getting started guide](http://fluxxor.com/guides/quick-start.html).

Support and Chat
----------------

Get help with and chat about Fluxxor [on Gitter](https://gitter.im/BinaryMuse/fluxxor).

[![Gitter chat](https://badges.gitter.im/BinaryMuse/fluxxor.png)](https://gitter.im/BinaryMuse/fluxxor)

License
-------

Fluxxor is licensed under the [MIT license](LICENSE).

> The MIT License (MIT)
>
> Copyright (c) 2014 Brandon Tilley
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
