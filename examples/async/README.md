Asynchronous Data Example
=========================

This is a very simple Fluxxor application demonstrating how to deal with asynchronous data. It fakes an asynchronous API that returns suggested catch phrases for your new startup and allows you to submit new suggested catch phrases (50% of the time it simulates an error instead). The Fluxxor website describes the technique in more detail in [the asynchronous data guide](http://fluxxor.com/guides/async-data.html).

To run, simply open `app/index.html` in your web browser—`index.html`, `bundle.js`, and an internet connection (for loading libraries via CDN) are all that's required to run the application (`bundle.js` is build with [Webpack](http://webpack.github.io/)). If you want to modify the source and see your updates, run `./start.sh` and point your browser to `http://localhost:8089/index.html` (you will need to install the `devDependencies` from the root of the Fluxxor project first).
