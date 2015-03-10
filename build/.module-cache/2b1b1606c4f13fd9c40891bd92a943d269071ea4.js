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
      } else {
        this.ref.set(false);
      }
    }.bind(this));
  },
  toggleCheck: function(event) {
    this.ref.set(!this.checked);
    event.preventDefault();
  },
  render: function() {
    var doneClass = this.state.checked ? "todo-done" : "todo-not-done";
    return (
      React.createElement("a", {
        onClick: this.toggleCheck, 
        href: "#", 
        className: "pull-left todo-check" + doneClass}, 
        React.createElement("span", {
          className: "todo-check-mark glyphicon glyphicon-ok", 
          "aria-hidden": "true"}
        )
      )
    );
  },
});

var Todo = React.createClass({displayName: "Todo",
  getInitialState: function() {
    this.text = "";
    return {text: ""};
  },
  componentWillUnmount: function() {
    this.ref.off();
  },
  componentWillMount: function() {
    this.ref = new Firebase(fb + "/react_todos/" + this.props.todoKey);
    
    // Update the todo's text when it changes.
    this.ref.on("value", function(snap) {
      if (snap.val() !== null) {
        this.text = snap.val().text;
        this.setState({
          text: this.text
        });
      } else {
        this.ref.update({
          text: ""
        });
      }
    }.bind(this));
  },
  render: function() {
    return (
      React.createElement("li", {id: this.props.todoKey, className: "list-group-item todo"}, 
        React.createElement(TodoCheck, {todoKey: this.props.todoKey}), 
        React.createElement(TodoText, {todoKey: this.props.todoKey})
      )
    );
  }
});

var TodoText = React.createClass({displayName: "TodoText",
  componentWillMount: function() {
    this.ref = new Firebase(fb + "/react_todos/" + this.props.todoKey + "text");
    
    // Update the todo's text when it changes.
    this.ref.on("value", function(snap) {
      if (snap.val() !== null) {
        this.text = snap.val();
        this.setState({
          text: this.text
        });
      } else {
        this.ref.set("");
      }
    }.bind(this));
  },
  onTextBlur: function(event) {
    this.ref.set($(event.target).text());
  },
  render: function() {
    React.createElement("span", {
      onBlur: this.onTextBlur, 
      contentEditable: "true", 
      "data-ph": "Todo", 
      className: "todo-text"}, 
        this.state.text
    )
  },
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