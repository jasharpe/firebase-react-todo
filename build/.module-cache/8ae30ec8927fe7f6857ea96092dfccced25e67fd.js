var Todo = React.createClass({displayName: "Todo",
  render: function() {
    return React.createElement("h1", null, "Hello, world!");
  }
});

var TodoList = React.createClass({displayName: "TodoList",
  render: function() {
    return (
      React.createElement("div", null, 
        todos
      )
    );
  }
});

React.render(
  React.createElement(Todo, null),
  document.getElementById('content')
);