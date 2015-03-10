var Todo = React.createClass({displayName: "Todo",
  render: function() {
    return (
      React.createElement("li", {id: "{this.props.key}", class: "list-group-item todo"}, 
        React.createElement("a", {href: "#", class: "pull-left todo-check"}, 
          React.createElement("span", {class: "todo-check-mark glyphicon glyphicon-ok", "aria-hidden": "true"}, "stuff")
        ), 
        React.createElement("span", {contenteditable: "true", "data-ph": "Todo", class: "todo-text"}, this.props.text)
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