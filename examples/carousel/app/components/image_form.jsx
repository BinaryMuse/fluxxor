/** @jsx React.DOM */

React = require("react");

var ImageForm = React.createClass({
  propTypes: {
    onAddUrl: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return { url: '' };
  },

  render: function() {
    return (
      <form onSubmit={this.onSubmit}>
        <input type="text" placeholder="Enter URL" size="30"
               value={this.state.url} onChange={this.handleChange} />
        <input type="submit" value="Add URL" />
      </form>
    );
  },

  handleChange: function(e) {
    this.setState({url: e.target.value});
  },

  onSubmit: function(e) {
    e.preventDefault();
    this.props.onAddUrl(this.state.url);
    this.setState({url: ''});
  }
});

module.exports = ImageForm;
