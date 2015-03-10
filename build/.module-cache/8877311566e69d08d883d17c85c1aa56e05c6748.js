var Todo = React.createClass({displayName: "Todo",
  getInitialState: function() {
    this.text = "";
    return {text: ""};
  },
  componentWillUnmount: function() {
    this.ref.off();
  },
  componentWillMount: function() {
    this.ref = new Firebase("https://glaring-fire-5349.firebaseio.com/react_todo_list/");
    
    // Add an empty todo if none currently exist.
    this.ref.on("value", function(snap) {
      if (snap.val() === null) {
        this.ref.push({
          text: "",
          checked: false,
        });
      }
    }.bind(this));

    // Add an added child to this.todos.
    this.ref.on("child_added", function(childSnap) {
      this.todos.push({
        k: childSnap.key(),
        val: childSnap.val()
      });
      this.setState({
        todos: this.todos
      });
    }.bind(this));

    this.ref.on("child_removed", function(childSnap) {
      var key = childSnap.key();
      var i;
      for (i = 0; i < this.todos.length; i++) {
        if (this.todos[i].k == key) {
          break;
        }
      }
      this.todos.splice(i, 1);
      this.setState({
        todos: this.todos
      });
    }.bind(this));
  },
  render: function() {
    return (
      React.createElement("li", {id: this.props.todoKey, className: "list-group-item todo"}, 
        React.createElement("a", {href: "#", className: "pull-left todo-check"}, 
          React.createElement("span", {className: "todo-check-mark glyphicon glyphicon-ok", "aria-hidden": "true"})
        ), 
        React.createElement("span", {contentEditable: "true", "data-ph": "Todo", className: "todo-text"}, this.props.text)
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
    
    // Add an empty todo if none currently exist.
    this.ref.on("value", function(snap) {
      if (snap.val() === null) {
        this.ref.push({
          text: "",
          checked: false,
        });
      }
    }.bind(this));

    // Add an added child to this.todos.
    this.ref.on("child_added", function(childSnap) {
      this.todos.push({
        k: childSnap.key(),
        val: childSnap.val()
      });
      this.setState({
        todos: this.todos
      });
    }.bind(this));

    this.ref.on("child_removed", function(childSnap) {
      var key = childSnap.key();
      var i;
      for (i = 0; i < this.todos.length; i++) {
        if (this.todos[i].k == key) {
          break;
        }
      }
      this.todos.splice(i, 1);
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
      return (
        React.createElement(Todo, {todoKey: todo.k})
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