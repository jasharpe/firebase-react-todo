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
  getInitialState: function() {
    this.todos = [];
    return {todos: []};
  },
  componentWillMount: function() {
    this.ref = new Firebase("https://glaring-fire-5349.firebaseio.com/react_todos/");
    this.ref.once("value", function(snap) {
      if (snap.val() === null) {
        this.ref.push({
          text: "",
          checked: false,
        });
      }
      console.log(snap.val());
    }.bind(this));
    this.ref.on("child_added", function(childSnap) {
      this.todos.push(childSnap.val());
      this.setState({
        todos: this.todos
      });
    }.bind(this));
  },
  componentWillUnmount: function() {
    this.ref.off();
  },
  render: function() {
    var todos = this.state.todos.map(function (todo) {
      console.log(todo);
      return (
        React.createElement(Todo, null)
      );
    });
    return (
      React.createElement("div", null, 
        React.createElement("h1", {id: "list_title"}, this.props.title), 
        React.createElement("ul", {id: "todo-list", className: "list-group"}, 
          todos
        )
      )
    );
  }
});

var ListPage = React.createClass({displayName: "ListPage",
  render: function() {
    return (
      React.createElement("div", null, 
        React.createElement("div", {id: "list_page"}, 
          React.createElement("a", {href: "?", id: "lists_link", className: "btn btn-primary"}, "Back to Lists")
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
    React.createElement(TodoList, {key: "asdf", title: "hi", todos: []})
  ),
  document.getElementById('content')
);