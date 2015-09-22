var React = require("react"),
    ReactRouter = require("react-router");

module.exports = React.createClass({
    render: function() {
        return <div>{this.props.children}</div>;
    }
});
