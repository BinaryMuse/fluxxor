var React = require("react"),
    Router = require("react-router"),
    RouteHandler = Router.RouteHandler;

module.exports = React.createClass({
  render: function() {
    return <RouteHandler {...this.props} />;
  }
});
