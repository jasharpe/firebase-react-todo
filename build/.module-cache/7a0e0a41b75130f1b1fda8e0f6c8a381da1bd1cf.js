var Todo = React.createClass({displayName: "Todo",
  render: function() {
    return (
      React.createElement("li", {id: "{this.props.key}", className: "list-group-item todo"}, 
        React.createElement("a", {href: "#", className: "pull-left todo-check"}, 
          React.createElement("span", {className: "todo-check-mark glyphicon glyphicon-ok", "aria-hidden": "true"})
        ), 
        React.createElement("span", {contentEditable: "true", "data-ph": "Todo", class: "todo-text"}, this.props.text)
      )
    );
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
      React.createElement("ul", {id: "todo-list", class: "list-group"}, 
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