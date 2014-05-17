/** @jsx React.DOM */

React = require("react");

var ImageForm = React.createClass({
  propTypes: {
    onAddUrl: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <form onSubmit={this.onSubmit}>
        <input ref="url" type="text" placeholder="Enter URL" size="30" />
        <input type="submit" value="Add URL" />
      </form>
    );
  },

  onSubmit: function(e) {
    e.preventDefault();
    var node = this.refs.url.getDOMNode();
    this.props.onAddUrl(node.value);
    node.value = "";
  }
});

module.exports = ImageForm;
