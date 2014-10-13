/** @jsx React.DOM */

var React = require("react"),
    Fluxxor = require("../../../");

window.React = React;

var BuzzwordClient = {
  load: function(success, failure) {
    setTimeout(function() {
      success(_.range(10).map(Faker.Company.catchPhrase));
    }, 1000);
  },

  submit: function(word, success, failure) {
    setTimeout(function() {
      if (Math.random() > 0.5) {
        success(word);
      } else {
        failure("Failed to " + Faker.Company.bs());
      }
    }, Math.random() * 1000 + 500);
  }
};

var constants = {
  LOAD_BUZZ: "LOAD_BUZZ",
  LOAD_BUZZ_SUCCESS: "LOAD_BUZZ_SUCCESS",
  LOAD_BUZZ_FAIL: "LOAD_BUZZ_FAIL",

  ADD_BUZZ: "ADD_BUZZ",
  ADD_BUZZ_SUCCESS: "ADD_BUZZ_SUCCESS",
  ADD_BUZZ_FAIL: "ADD_BUZZ_FAIL"
};

var actions = {
  loadBuzz: function() {
    this.dispatch(constants.LOAD_BUZZ);

    BuzzwordClient.load(function(words) {
      this.dispatch(constants.LOAD_BUZZ_SUCCESS, {words: words});
    }.bind(this), function(error) {
      this.dispatch(constants.LOAD_BUZZ_FAIL, {error: error});
    }.bind(this));
  },

  addBuzz: function(word) {
    var id = _.uniqueId();
    this.dispatch(constants.ADD_BUZZ, {id: id, word: word});

    BuzzwordClient.submit(word, function() {
      this.dispatch(constants.ADD_BUZZ_SUCCESS, {id: id});
    }.bind(this), function(error) {
      this.dispatch(constants.ADD_BUZZ_FAIL, {id: id, error: error});
    }.bind(this));
  }
};

var BuzzwordStore = Fluxxor.createStore({
  initialize: function() {
    this.loading = false;
    this.error = null;
    this.words = {};

    this.bindActions(
      constants.LOAD_BUZZ, this.onLoadBuzz,
      constants.LOAD_BUZZ_SUCCESS, this.onLoadBuzzSuccess,
      constants.LOAD_BUZZ_FAIL, this.onLoadBuzzFail,

      constants.ADD_BUZZ, this.onAddBuzz,
      constants.ADD_BUZZ_SUCCESS, this.onAddBuzzSuccess,
      constants.ADD_BUZZ_FAIL, this.onAddBuzzFail
    );
  },

  onLoadBuzz: function() {
    this.loading = true;
    this.emit("change");
  },

  onLoadBuzzSuccess: function(payload) {
    this.loading = false;
    this.error = null;

    this.words = payload.words.reduce(function(acc, word) {
      var clientId = _.uniqueId();
      acc[clientId] = {id: clientId, word: word, status: "OK"};
      return acc;
    }, {});
    this.emit("change");
  },

  onLoadBuzzFail: function(payload) {
    this.loading = false;
    this.error = payload.error;
    this.emit("change");
  },

  onAddBuzz: function(payload) {
    var word = {id: payload.id, word: payload.word, status: "ADDING"};
    this.words[payload.id] = word;
    this.emit("change");
  },

  onAddBuzzSuccess: function(payload) {
    this.words[payload.id].status = "OK";
    this.emit("change");
  },

  onAddBuzzFail: function(payload) {
    this.words[payload.id].status = "ERROR";
    this.words[payload.id].error = payload.error;
    this.emit("change");
  }
});

var stores = {
  BuzzwordStore: new BuzzwordStore()
};

var flux = new Fluxxor.Flux(stores, actions);

window.flux = flux;

flux.on("dispatch", function(type, payload) {
  if (console && console.log) {
    console.log("[Dispatch]", type, payload);
  }
});

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Application = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("BuzzwordStore")],

  getInitialState: function() {
    return {
      suggestBuzzword: ""
    };
  },

  getStateFromFlux: function() {
    var store = this.getFlux().store("BuzzwordStore");
    return {
      loading: store.loading,
      error: store.error,
      words: _.values(store.words)
    };
  },

  render: function() {
    return (
      <div>
        <h1>All the Buzzwords</h1>
        {this.state.error ? "Error loading data" : null}
        <ul style={{lineHeight: "1.3em", minHeight: "13em"}}>
          {this.state.loading ? <li>Loading...</li> : null}
          {this.state.words.map(function(word) {
            return <Word key={word.id} word={word} />;
          })}
        </ul>
        <h2>Suggest a New Buzzword</h2>
        <form onSubmit={this.handleSubmitForm}>
          <input type="text" value={this.state.suggestBuzzword}
                 onChange={this.handleSuggestedWordChange} />
          <input type="submit" value="Add" />
        </form>
      </div>
    );
  },

  componentDidMount: function() {
    this.getFlux().actions.loadBuzz();
  },

  handleSuggestedWordChange: function(e) {
    this.setState({suggestBuzzword: e.target.value});
  },

  handleSubmitForm: function(e) {
    e.preventDefault();
    if (this.state.suggestBuzzword.trim()) {
      this.getFlux().actions.addBuzz(this.state.suggestBuzzword);
      this.setState({suggestBuzzword: ""});
    }
  }
});

var Word = React.createClass({
  render: function() {
    var statusText, statusStyle = {};
    switch(this.props.word.status) {
    case "OK":
      statusText = "";
      break;
    case "ADDING":
      statusText = "adding...";
      statusStyle = { color: "#ccc" };
      break;
    case "ERROR":
      statusText = "error: " + this.props.word.error;
      statusStyle = { color: "red" };
      break;
    }

    return (
      <li key={this.props.word.word}>
        {this.props.word.word} <span style={statusStyle}>{statusText}</span>
      </li>
    );
  }
});

React.renderComponent(<Application flux={flux} />, document.getElementById("app"));
