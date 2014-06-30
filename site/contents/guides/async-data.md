---
title: Dealing with Asynchronous Data
template: page.ejs
---

Dealing with Asynchronous Data
==============================

In any decently complex JavaScript web application, you'll likely need to fetch data from an external source, and this means dealing with asynchronous data fetching. It's not always very obvious how to structure this activity in a flux application.

The short answer is, in order to ensure that all the stores in your application have a chance to respond to the successful (or unsuccessful) loading of asynchronous data, you should fire additional actions from your asynchronous handlers to indicate when loading fails or succeeds. Let's look at an example.

> Note: The code for this example is [available in the GitHub repository](https://github.com/BinaryMuse/fluxxor/tree/master/examples/async/). Note that Faker and Lo-Dash are loaded via CDN in `index.html`.

This application simulates an asynchronous API using `setTimeout` that performs two operations:

 1. Gets a list of catch phrases for your new startup
 2. Allows you to submit new catch phrases to the database

To allow for testing error conditions, 50% of the time submitting a new phrase will fail with an error. Here's the app running:

<div id="app"></div>

Let's walk through building the app together.

The Client API
--------------

Since we're using a fake asynchronous API, we just have a dumb client object that waits for 1000 milliseconds before responding. It has two methods; `load` returns 10 buzzwords, and `submit` takes a buzzword and either reports a success or error (to simulate submitting a suggestion to a server).

```javascript
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
    }, 1000);
  }
};
```

Actions
-------

There are two application intents we'll capture via actions; one is to load the initial set of buzzwords, and the other is to submit a new buzzword. However, since we're dealing with asynchronous operations, we'll also define a `SUCCESS` and `FAIL` action type for each.

```javascript
var constants = {
  LOAD_BUZZ: "LOAD_BUZZ",
  LOAD_BUZZ_SUCCESS: "LOAD_BUZZ_SUCCESS",
  LOAD_BUZZ_FAIL: "LOAD_BUZZ_FAIL",

  ADD_BUZZ: "ADD_BUZZ",
  ADD_BUZZ_SUCCESS: "ADD_BUZZ_SUCCESS",
  ADD_BUZZ_FAIL: "ADD_BUZZ_FAIL"
};
```

The actions themselves will immediately dispatch the `LOAD_BUZZ` or `ADD_BUZZ` action types so that any stores that want to optimisically update the UI can do so. They will then delegate to the `BuzzwordClient` and dispatch the appropriate success or failure action type depending on how it responds.

We also generate a temporary client-side ID that we can use to track a specific word across the asynchronous operations, and include it in part of the payload when adding a new buzzword.

```javascript
var clientId = 0; // simple helper var to generate temporary client-side IDs
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
    var id = clientId++;
    this.dispatch(constants.ADD_BUZZ, {id: id, word: word});

    BuzzwordClient.submit(word, function() {
      this.dispatch(constants.ADD_BUZZ_SUCCESS, {id: id});
    }.bind(this), function(error) {
      this.dispatch(constants.ADD_BUZZ_FAIL, {id: id, error: error});
    }.bind(this));
  }
};
```

From here on out, our app will look pretty similar to any other.

Store
-----

Our store now needs to watch for the various actions and update appropriately. While the code looks a little more verbose than its synchronous counterparts (because, well, it is), it keeps the flow of data throughout the system explicit.

```
var BuzzwordStore = Fluxxor.createStore({
  initialize: function() {
    this.loading = false;
    this.adding = false;
    this.error = null;
    this.words = [];
    this.loadingWords = {};

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
    this.words = [];
    this.error = null;
    this.emit("change");
  },

  onLoadBuzzSuccess: function(payload) {
    this.loading = false;
    this.words = payload.words.map(function(word) {
      return {word: word, status: "OK"};
    });
    this.emit("change");
  },

  onLoadBuzzFail: function(payload) {
    this.loading = false;
    this.error = payload.error;
    this.emit("change");
  },

  onAddBuzz: function(payload) {
    var word = {word: payload.word, status: "ADDING"};
    this.words.push(word);
    this.loadingWords[payload.id] = word;
    this.emit("change");
  },

  onAddBuzzSuccess: function(payload) {
    this.loadingWords[payload.id].status = "OK";
    delete this.loadingWords[payload.id];
    this.emit("change");
  },

  onAddBuzzFail: function(payload) {
    this.loadingWords[payload.id].status = "ERROR";
    this.loadingWords[payload.id].error = payload.error;
    delete this.loadingWords[payload.id];
    this.emit("change");
  }
});
```

The `BuzzwordStore` code is pretty straightforward; the most interesting portion is probably the last three methods. Notice we optimistically add the submitted word to the store in `onAddBuzz` even though we don't know if it will succeed or not. Later, in `onAddBuzzSuccess` and `onAddBuzzFail`, we track down the word in question and update its status accordingly. In another app, we might present an alert to the user upon failure, or remove the word from the store completely.

The UI
------

For completeness, here is the UI for this application. Note that the `Word` component looks at the status for the word object to determine how to display it to the user. Also notice how the application can render itself even when the store is empty; this is an important property for flux apps that need to load data asynchronously.

```javascript
var stores = {
  BuzzwordStore: new BuzzwordStore()
};

var flux = new Fluxxor.Flux(stores, actions);

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
      words: store.words
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
            return <Word word={word} />;
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
```

And that's it! Be sure to check out [the full example in the GitHub repo](https://github.com/BinaryMuse/fluxxor/tree/master/examples/async/).

<script src="https://cdnjs.cloudflare.com/ajax/libs/Faker/0.7.2/MinFaker.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js"></script>
<script src="async-bundle.js"></script>
