var Constants = require("./constants");

module.exports = {
  nextImage: function() {
    this.dispatch(Constants.NEXT_IMAGE);
  },

  prevImage: function() {
    this.dispatch(Constants.PREV_IMAGE);
  },

  selectImage: function(i) {
    this.dispatch(Constants.SEL_IMAGE, {index: i});
  },

  addImage: function(url) {
    this.dispatch(Constants.ADD_IMAGE, {url: url});
  }
};
