/** @jsx React.DOM */

var React = require("react"),
    Fluxxor = require("../../../../"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Carousel = require("./carousel.jsx"),
    ImageForm = require("./image_form.jsx");

var Application = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("ImageStore", "CarouselStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      images: flux.store("ImageStore").getState(),
      carousel: flux.store("CarouselStore").getState()
    };
  },

  render: function() {
    return (
      <section className="application-container">
        <Carousel images={this.state.images.images}
                  selected={this.state.carousel.current}
                  onClickLeft={this.onClickLeft}
                  onClickRight={this.onClickRight}
                  onSelectImage={this.onSelectImage} />
        <ImageForm onAddUrl={this.onAddUrl} />
      </section>
    );
  },

  onClickLeft: function() {
    this.getFlux().actions.prevImage();
  },

  onClickRight: function() {
    this.getFlux().actions.nextImage();
  },

  onSelectImage: function(i) {
    this.getFlux().actions.selectImage(i);
  },

  onAddUrl: function(url) {
    this.getFlux().actions.addImage(url);
  }
});

module.exports = Application;
