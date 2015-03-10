var fb = "https://glaring-fire-5349.firebaseio.com";

var TodoCheck = React.createClass({displayName: "TodoCheck",
  getInitialState: function() {
    this.checked = false;
    return {checked: this.checked};
  },
  componentWillUnmount: function() {
    this.ref.off();
  },
  componentWillMount: function() {
    this.ref = new Firebase(fb + "/react_todos/" + this.props.todoKey + "/checked");
    
    // Update the checked state when it changes.
    this.ref.on("value", function(snap) {
      if (snap.val() !== null) {
        this.checked = snap.val();
        this.setState({
          checked: this.checked
        });
        this.props.todo.setDone(this.checked);
      } else {
        this.ref.set(false);
        this.props.todo.setDone(false);
      }
    }.bind(this));
  },
  toggleCheck: function(event) {
    this.ref.set(!this.checked);
    event.preventDefault();
  },
  render: function() {
    return (
      React.createElement("a", {
        onClick: this.toggleCheck, 
        href: "#", 
        className: "pull-left todo-check"}, 
        React.createElement("span", {
          className: "todo-check-mark glyphicon glyphicon-ok", 
          "aria-hidden": "true"}
        )
      )
    );
  },
});

var TodoText = React.createClass({displayName: "TodoText",
  componentWillUnmount: function() {
    this.ref.off();
    $("#" + this.props.todoKey + "-text").off('blur');
  },
  setText: function(text) {
    this.text = text;
    this.props.todo.setHasText(!!text);
  },
  componentWillMount: function() {
    this.ref = new Firebase(fb + "/react_todos/" + this.props.todoKey + "/text");
    
    // Update the todo's text when it changes.
    this.setText("");
    this.ref.on("value", function(snap) {
      if (snap.val() !== null) {
        $("#" + this.props.todoKey + "-text").text(snap.val());
        this.setText(snap.val());
      } else {
        this.ref.set("");
      }
    }.bind(this));
  },
  onTextBlur: function(event) {
    this.ref.set($(event.target).text());
  },
  render: function() {
    setTimeout(function() {
      $("#" + this.props.todoKey + "-text").text(this.text);
    }.bind(this), 0);
    return (
      React.createElement("span", {
        id: this.props.todoKey + "-text", 
        onBlur: this.onTextBlur, 
        contentEditable: "plaintext-only", 
        "data-ph": "Todo", 
        className: "todo-text"}
      )
    );
  },
});

var TodoDelete = React.createClass({displayName: "TodoDelete",
  getInitialState: function() {
    return {};
  },
  componentWillUnmount: function() {
    this.ref.off();
  },
  componentWillMount: function() {
    this.ref = new Firebase(fb + "/react_todos/" + this.props.todoKey + "/deleted");
  },
  onClick: function() {
    this.ref.set(true);
  },
  render: function() {
    if (this.props.isLast) {
      return null;
    }
    return (
      React.createElement("button", {
        onClick: this.onClick, type: "button", 
        className: "close", "aria-label": "Close"}, 
        React.createElement("span", {
          "aria-hidden": "true", 
          dangerouslySetInnerHTML: {__html: '&times;'}})
      )
    );
  },
});

var Todo = React.createClass({displayName: "Todo",
  getInitialState: function() {
    return {};
  },
  setDone: function(done) {
    this.setState({
      done: done
    });
  },
  setHasText: function(hasText) {
    this.setState({
      hasText: hasText
    });
  },
  render: function() {
    var doneClass = this.state.done ? "todo-done" : "todo-not-done";
    return (
      React.createElement("li", {
        id: this.props.todoKey, 
        className: "list-group-item todo " + doneClass}, 
        React.createElement(TodoCheck, {todo: this, todoKey: this.props.todoKey}), 
        React.createElement(TodoText, {todo: this, todoKey: this.props.todoKey}), 
        React.createElement(TodoDelete, {isLast: false, todoKey: this.props.todoKey})
      )
    );
  }
});

var TodoList = React.createClass({displayName: "TodoList",
  getInitialState: function() {
    this.todos = [];
    return {todos: this.todos};
  },
  componentWillMount: function() {
    this.ref = new Firebase("https://glaring-fire-5349.firebaseio.com/react_todos/");
    
    // Add an empty todo if none currently exist.
    this.ref.on("value", function(snap) {
      if (snap.val() === null) {
        this.ref.push({
          text: "",
        });
        return;
      }

      // Add a new todo if no undeleted ones exist.
      var returnedTrue = snap.forEach(function(data) {
        if (!data.val().deleted) {
          return true;
        }
      });
      if (!returnedTrue) {
        this.ref.push({
          text: "",
        });
        return;
      }
    }.bind(this));

    // Add an added child to this.todos.
    this.ref.on("child_added", function(childSnap) {
      this.todos.push({
        k: childSnap.key(),
        val: childSnap.val()
      });
      this.replaceState({
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
      this.replaceState({
        todos: this.todos,
      });
    }.bind(this));

    this.ref.on("child_changed", function(childSnap) {
      var key = childSnap.key();
      for (var i = 0; i < this.todos.length; i++) {
        if (this.todos[i].k == key) {
          this.todos[i].val = childSnap.val();
          this.replaceState({
            todos: this.todos,
          });
          break;
        }
      }
    }.bind(this));
  },
  componentWillUnmount: function() {
    this.ref.off();
  },
  render: function() {
    console.log(this.todos);
    var todos = this.state.todos.map(function (todo) {
      if (todo.val.deleted) {
        return null;
      }
      return (
        React.createElement(Todo, {todoKey: todo.k})
      );
    }).filter(function(todo) { return todo !== null; });
    console.log(todos);
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
          React.createElement("a", {
            onClick: this.props.app.navOnClick({page: "LISTS"}), 
            href: "/#/lists", 
            id: "lists_link", 
            className: "btn btn-primary"}, 
              "Back to Lists"
          )
        ), 
        React.createElement("div", {className: "page-header"}, 
          this.props.children
        )
      )
    );
  }
});

var Nav = React.createClass({displayName: "Nav",
  render: function() {
    return (
      React.createElement("nav", {className: "navbar navbar-default navbar-static-top"}, 
        React.createElement("div", {className: "container"}, 
          React.createElement("div", {className: "navbar-header"}, 
            React.createElement("a", {onClick: this.props.app.navOnClick({page: "LISTS"}), className: "navbar-brand", href: "/#/lists"}, "Firebase Todo")
          ), 
          React.createElement("ul", {className: "nav navbar-nav"}, 
            React.createElement("li", null, React.createElement("a", {onClick: this.props.app.navOnClick({page: "LISTS"}), href: "/#/lists"}, "Lists"))
          )
        )
      )
    );
  },
});

var App = React.createClass({displayName: "App",
  getInitialState: function() {
    var state = this.getState();
    this.setHistory(state, true);
    return this.getState();
  },
  setHistory: function(state, replace) {
    // Don't bother pushing a history entry if the latest state is
    // the same.
    if (_.isEqual(state, this.state)) {
      return;
    }

    var histFunc = replace ?
        history.replaceState.bind(history) :
        history.pushState.bind(history);
    if (state.page === "LIST") {
      histFunc(state, "", "#/list/" + state.todoListKey);
    } else if (state.page === "LISTS") {
      histFunc(state, "", "#/lists");
    } else {
      console.log("Unknown page: " + state.page);
    }
  },
  getState: function() {
    var url = document.location.toString();
    if (url.match(/#/)) {
      var path = url.split("#")[1];
      var res = path.match(/\/list\/([^\/]*)$/);
      if (res) {
        return {
          page: "LIST",
          todoListKey: res[1],
        };
      }
      res = path.match(/lists$/);
      if (res) {
        return {
          page: "LISTS"
        }
      }
    }
    return {
      page: "LISTS"
    }
  },
  componentWillMount: function() {
    // Register history listeners.
    var app = this;
    window.onpopstate = function(event) {
      app.replaceState(event.state);
    };
  },
  navOnClick: function(state) {
    return function(event) {
      this.setHistory(state, false);
      this.replaceState(state);
      event.preventDefault();
    }.bind(this);
  },
  getPage: function() {
    if (this.state.page === "LIST") {
      return (
        React.createElement(ListPage, {app: this}, 
          React.createElement(TodoList, {todoListKey: this.state.todoListKey})
        )
      );
    } else if (this.state.page === "LISTS") {
      return (
        React.createElement("a", {onClick: this.navOnClick({page: "LIST", todoListKey: "-JjcFYgp1LyD5oDNNSe2"}), href: "/#/list/-JjcFYgp1LyD5oDNNSe2"}, "hi")
      );
    } else {
      console.log("Unknown page: " + this.state.page);
    }
  },
  render: function() {
    return (
      React.createElement("div", null, 
        React.createElement(Nav, {app: this}), 
        React.createElement("div", {className: "container", role: "main"}, 
          this.getPage()
        )
      )
    );
  }
});

React.render(
  React.createElement(App, null),
  document.getElementById('content')
);