var Todo = React.createClass({displayName: "Todo",
  render: function() {
    return React.createElement("h1", null, "Hello, world!");
  }
});

var TodoList = React.createClass({displayName: "TodoList",
  render: function() {
    var todos = this.props.todos.map(function (todo) {
      return (
        React.createElement(Todo, null)
      );
    });
    return (
      React.createElement("div", null, 
        React.createElement(Todo, null), 
        React.createElement(Todo, null)
      )
    );
  }
});

React.render(
  React.createElement(TodoList, {todos: []}),
  document.getElementById('content')
);