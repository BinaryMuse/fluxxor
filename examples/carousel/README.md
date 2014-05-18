Carousel Example
================

This is a small example React application using Fluxbox.

![Screenshot](fluxbox-carousel-screenshot.png)

To run, simply open `app/index.html` in your web browser—`index.html`, `bundle.js`, and the `images/` directory are the only files required to run the application (`bundle.js` is build with [Webpack](http://webpack.github.io/)). If you want to modify the source and see your updates, run `./start.sh` and point your browser to `http://localhost:8089/index.html` (you will need to install the `devDependencies` from the root of the Fluxbox project first).

The entry point of the application is `app/app.jsx`. `React` is exported to the `window` object so that the [React Chrome Developer Tools](http://facebook.github.io/react/blog/2014/01/02/react-chrome-developer-tools.html) will appear; the `Fluxbox.Flux` instance is exported to `window.flux` so that you can manipulate the application from the standard JavaScript console (e.g. the methods on `window.flux.actions`).

Stores
------

The system contains two stores:

* `ImageStore` - Contains the list of images to display in the carousel
* `CarouselStore` - Contains information about the carousel position (which image is being displayed, etc.) and ensures that the user cannot change images while a transition is in progress

This separation is perhaps a bit contrived, but shows how you might use multiple stores in a Flux-based React application.

Actions
-------

There are four actions that manipulate the stores:

* `prevImage` - Moves the carousel to the previous image (modifies `CarouselStore`)
* `nextImage` - Moves the carousel to the next image (modifies `CarouselStore`)
* `selectImage` - Moves the carousel to a specific image (modifies `CarouselStore`)
* `addImage` - Adds an image to the carousel and moves to that image (modifies `ImageStore` and `CarouselStore`)

`addImage` is particularly interesting because the action handler inside `CarouselStore` utilizes the `waitFor` mechanism to allow the `ImageStore` to accept or reject adding the image (based on its file extension and whether the image is already in the carousel).

Components
----------

* `Application` - The top-level component that maintains state from the stores using `Fluxbox.StoreWatchMixin`
* `Carousel` - The actual image carousel itself; all data is passed as props, and user interaction is propagated back to `Application`
* `ImageForm` - A small form for adding images to the carousel; user interaction is propagated back to `Application`

---

In this small application, only the top level `Application` component requires access to the Flux data (via `this.props.flux`). However, since `Application` mixes in `Fluxbox.FluxMixin`, all children of `Application` automatically have access to the `Fluxbox.Flux` instance at their `this.context.flux` properties.
