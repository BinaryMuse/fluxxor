var Fluxxor = require("../../../../"),
    Constants = require("../constants");

var CarouselStore = Fluxxor.createStore({
  initialize: function(options) {
    this.current = options.current || 0;
    this.count = options.count || 0;

    this.bindActions(Constants.NEXT_IMAGE, this.handleNextImage,
                     Constants.PREV_IMAGE, this.handlePrevImage,
                     Constants.SEL_IMAGE,  this.handleSelectImage,
                     Constants.ADD_IMAGE,  this.handleAddImage);
  },

  getState: function() {
    return {
      current: this.current,
      count: this.count
    };
  },

  handleNextImage: function() {
    if (this.animating) return;
    var next = this.current + 1;
    if (next >= this.count) next = 0;
    this.selectImage(next);
    this.emit("change");
  },

  handlePrevImage: function() {
    if (this.animating) return;
    var next = this.current - 1;
    if (next < 0) next = this.count - 1;
    this.selectImage(next);
    this.emit("change");
  },

  handleSelectImage: function(payload) {
    this.selectImage(payload.index);
    this.emit("change");
  },

  handleAddImage: function() {
    this.waitFor(["ImageStore"], function(imageStore) {
      var length = imageStore.getState().images.length;
      // ImageStore may block adding a new image
      if (this.count < length) {
        this.count = length;
        this.selectImage(this.count - 1);
        this.emit("change");
      }
    });
  },

  selectImage: function(index) {
    if (this.animating) return;
    this.animating = true;
    this.current = index;
    setTimeout(function() {
      this.animating = false;
    }.bind(this), 300);
  }
});

module.exports = CarouselStore;
