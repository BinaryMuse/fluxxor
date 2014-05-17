/** @jsx React.DOM */

var React = require("react");

var Carousel = React.createClass({
  propTypes: {
    images: React.PropTypes.array.isRequired,
    selected: React.PropTypes.number.isRequired,
    onClickLeft: React.PropTypes.func.isRequired,
    onClickRight: React.PropTypes.func.isRequired,
    onSelectImage: React.PropTypes.func.isRequired
  },

  render: function() {
    var left = this.props.selected * 300 * -1,
        ulStyle = {
          width: this.props.images.length * 300,
          "-ms-transform": "translate(" + left + "px,0px)",
          "-webkit-transform": "translate(" + left + "px,0px)",
          transform: "translate(" + left + "px,0px)"
        };

    return (
      <div>
        <span className="arrow left"
              onClick={this.props.onClickLeft}>&#x25C4;</span>
        <div className="carousel-stage">
          <ul style={ulStyle} className="carousel-list">
            {this.props.images.map(function(image, i) {
              return <li key={i}><img src={image} /></li>;
            })}
          </ul>
          <ul className="dots">
            {this.props.images.map(function(image, i) {
              var activeClass = i === this.props.selected ? "active" : "";
              return <li key={i}
                         className={"circle " + activeClass}
                         onClick={this.onClickDot.bind(this, i)}></li>;
            }.bind(this))}
          </ul>
        </div>
        <span className="arrow right"
              onClick={this.props.onClickRight}>&#x25BA;</span>
      </div>
    )
  },

  onClickDot: function(index) {
    this.props.onSelectImage(index);
  }
});

module.exports = Carousel;
