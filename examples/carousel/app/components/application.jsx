/** @jsx React.DOM */

var React = require("react"),
    Fluxbox = require("../../../../"),
    FluxMixin = Fluxbox.FluxMixin(React),
    StoreWatchMixin = Fluxbox.StoreWatchMixin(React);

var Carousel = require("./carousel.jsx"),
    ImageForm = require("./image_form.jsx");

var Application = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("ImageStore", "CarouselStore")],

  // Required by StoreWatchMixin
  getStateFromFlux: function() {
    var flux = this.props.flux;
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
    this.props.flux.actions.prevImage();
  },

  onClickRight: function() {
    this.props.flux.actions.nextImage();
  },

  onSelectImage: function(i) {
    this.props.flux.actions.selectImage(i);
  },

  onAddUrl: function(url) {
    this.props.flux.actions.addImage(url);
  }
});

module.exports = Application;
