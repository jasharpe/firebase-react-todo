var Todo = React.createClass({displayName: "Todo",
  render: function() {
    return (
      React.createElement("li", {id: '"' + this.props.key + '"', className: "list-group-item todo"}, 
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
      React.createElement("div", null, 
        React.createElement("h1", {id: "list_title"}, this.props.title), 
        React.createElement("ul", {id: "todo-list", className: "list-group"}, 
          React.createElement(Todo, null), 
          React.createElement(Todo, null)
        )
      )
    );
  }
});

var ListPage = React.createClass({displayName: "ListPage",
  render: function() {
    return (
      React.createElement("div", null, 
        React.createElement("div", {id: "list_page", className: "hidden"}, 
          React.createElement("a", {href: "?", id: "lists_link", class: "btn btn-primary"}, "Back to Lists")
        ), 
        React.createElement("div", {className: "page-header"}, 
          this.props.children
        )
      )
    );
  }
});

React.render(
  React.createElement(ListPage, null, 
    React.createElement(TodoList, {title: "hi", todos: []})
  ),
  document.getElementById('content')
);