/** @jsx React.DOM */

var React = require("react"),
    Fluxxor = require("../../../");

window.React = React;

var TodoActions = {
  ADD_TODO: "ADD_TODO",
  TOGGLE_TODO: "TOGGLE_TODO",
  CLEAR_TODOS: "CLEAR_TODOS",

  addTodo: function(text) {
    return Fluxxor.action(this.ADD_TODO, {text: text});
  },

  toggleTodo: function(todo) {
    return Fluxxor.action(this.TOGGLE_TODO, {todo: todo});
  },

  clearTodos: function() {
    return Fluxxor.action(this.CLEAR_TODOS);
  }
};

var TodoStore = Fluxxor.createStore({
  initialize: function() {
    this.todos = [];
    this.bindActions(
      TodoActions.ADD_TODO, this.onAddTodo,
      TodoActions.TOGGLE_TODO, this.onToggleTodo,
      TodoActions.CLEAR_TODOS, this.onClearTodos
    );
  },

  onAddTodo: function(payload) {
    this.todos.push({text: payload.text, complete: false});
    this.emit("change");
  },

  onToggleTodo: function(payload) {
    payload.todo.complete = !payload.todo.complete;
    this.emit("change");
  },

  onClearTodos: function() {
    this.todos = this.todos.filter(function(todo) {
      return !todo.complete;
    });
    this.emit("change");
  },

  getState: function() {
    return {
      todos: this.todos
    };
  }
});

var flux = new Fluxxor.Flux({
  TodoStore: new TodoStore()
});

window.flux = flux;

var FluxMixin = Fluxxor.FluxMixin(React),
    FluxChildMixin = Fluxxor.FluxChildMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Application = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("TodoStore")],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    // Normally we'd use one key per store, but we only have one store, so
    // we'll use the state of the store as our entire state here.
    return flux.store("TodoStore").getState();
  },

  render: function() {
    return (
      <div>
        <ul>
          {this.state.todos.map(function(todo, i) {
            return <li key={i}><TodoItem todo={todo} /></li>;
          })}
        </ul>
        <form onSubmit={this.onSubmitForm}>
          <input ref="input" type="text" size="30" placeholder="New Todo" />
          <input type="submit" value="Add Todo" />
        </form>
        <button onClick={this.clearCompletedTodos}>Clear Completed</button>
      </div>
    );
  },

  onSubmitForm: function(e) {
    e.preventDefault();
    var node = this.refs.input.getDOMNode();
    this.getFlux().dispatch(TodoActions.addTodo(node.value));
    node.value = "";
  },

  clearCompletedTodos: function(e) {
    this.getFlux().dispatch(TodoActions.clearTodos());
  }
});

var TodoItem = React.createClass({
  mixins: [FluxChildMixin],

  propTypes: {
    todo: React.PropTypes.object.isRequired
  },

  render: function() {
    var style = {
      textDecoration: this.props.todo.complete ? "line-through" : ""
    };

    return <span style={style} onClick={this.onClick}>{this.props.todo.text}</span>;
  },

  onClick: function() {
    this.getFlux().dispatch(TodoActions.toggleTodo(this.props.todo));
  }
});

React.renderComponent(<Application flux={flux} />, document.getElementById("app"));
