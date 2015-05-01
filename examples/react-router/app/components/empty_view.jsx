var React = require("react"),
    Router = require("react-router"),
    RouteHandler = Router.RouteHandler;

class EmptyView extends React.Component {
  render() {
    return <RouteHandler {...this.props} />;
  }
}

module.exports = EmptyView;
