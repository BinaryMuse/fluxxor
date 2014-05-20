/** @jsx React.DOM */

React = require("react");

var ImageForm = React.createClass({
  propTypes: {
    onAddUrl: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {value: ''};
  },

  render: function() {
    return (
      <form onSubmit={this.onSubmit}>
        <input ref="url" type="text" placeholder="Enter URL" size="30" value={this.state.value} onChange={this.handleChange} />
        <input type="submit" value="Add URL" />
      </form>
    );
  },

  handleChange: function() {
    this.setState({value: this.refs.url.getDOMNode().value});
  }, 

  onSubmit: function(e) {
    e.preventDefault();
    this.props.onAddUrl(this.refs.url.getDOMNode().value);
    this.setState({value: ''});
  }
});

module.exports = ImageForm;
