---
title: Carousel
template: page.ejs
---

Image Carousel
==============

<div id="app"></div>

This image carousel is a very simple React application built using Fluxbox. The source for the example can be found [on GitHub](https://github.com/BinaryMuse/fluxbox/tree/master/examples/carousel).

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

In this small application, only the top level `Application` component requires access to the Flux data (via `this.props.flux`). However, since `Application` mixes in `Fluxbox.FluxMixin`, all children of `Application` with the appropriate `contextTypes` property automatically have access to the `Fluxbox.Flux` instance at their `this.context.flux` properties.

<script src="carousel-bundle.js"></script>
<style>
.application-container {
  width: auto !important;
  float: none;
  padding-bottom: 10px;
}

#app form {
  margin-left: 35px;
}
</style>
