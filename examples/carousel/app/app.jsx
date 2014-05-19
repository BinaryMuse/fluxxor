/** @jsx React.DOM */

var React = require("react"),
    Fluxxor = require("../../../");

var Application = require("./components/application.jsx"),
    ImageStore = require("./stores/image_store"),
    CarouselStore = require("./stores/carousel_store"),
    actions = require("./actions");

require("./style.less");

window.React = React;

var images = ["images/bttf1.png", "images/bttf2.png", "images/bttf3.png",
              "images/bttf4.png", "images/bttf5.png", "images/bttf6.png"];

var stores = {
  CarouselStore: new CarouselStore({count: images.length}),
  ImageStore: new ImageStore({images: images})
};

var flux = new Fluxxor.Flux(stores, actions);
window.flux = flux;

React.renderComponent(<Application flux={flux} />, document.getElementById("app"));
