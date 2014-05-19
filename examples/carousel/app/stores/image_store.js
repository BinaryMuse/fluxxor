var Fluxxor = require("../../../../"),
    Constants = require("../constants");

var ImageStore = Fluxxor.createStore({
  initialize: function(options) {
    this.images = options.images || [];

    this.bindActions(Constants.ADD_IMAGE, this.handleAddImage);
  },

  getState: function() {
    return {
      images: this.images
    };
  },

  handleAddImage: function(payload) {
    if (!payload.url) return;
    // Don't allow duplicates
    if (this.images.indexOf(payload.url) > -1) return;
    var parts = payload.url.split(".");
    // Only allow images
    if (["png", "jpg", "jpeg", "gif"].indexOf(parts[parts.length - 1]) > -1) {
      this.images.push(payload.url);
      this.emit("change");
    }
  }
});

module.exports = ImageStore;
