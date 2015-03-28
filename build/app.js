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
    this.ref = new Firebase(this.props.listPath + "/" + this.props.todoKey + "/checked");
    
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

// TODO: fix copy and paste creating HTML entities.
var TodoText = React.createClass({displayName: "TodoText",
  componentWillUnmount: function() {
    this.ref.off();
  },
  setText: function(text) {
    this.text = text;
    this.props.todo.setText(text);
  },
  componentWillMount: function() {
    this.ref = new Firebase(this.props.listPath + "/" + this.props.todoKey + "/text");

    // Update the todo's text when it changes.
    this.setText("");
    this.ref.on("value", function(snap) {
      if (snap.val() !== null) {
        if (this.text == snap.val()) {
          return;
        }
        this.props.todo.setIsEmpty(snap.val() === "");
        var shouldFade =
            ($("#" + this.props.todoKey + "-text").text() != snap.val());
        $("#" + this.props.todoKey + "-text").text(snap.val());
        this.setText(snap.val());

        // This is only triggered if someone else changed the text (since
        // otherwise local edits would have caused the span text to equal
        // the snap value already).
        if (shouldFade) {
          $($("#" + this.props.todoKey + "-text").parent())
              .animate({"background-color": "#fad163"}, 0)
              .animate({"background-color": "white"}, 2000);
        }
      } else {
        this.ref.set("");
      }
    }.bind(this));
  },
  componentDidMount: function() {
    $("#" + this.props.todoKey + "-text").text(this.text);
  },
  onTextBlur: function(event) {
    this.ref.set($(event.target).text());
  },
  // TODO: figure out how to put the caret at the end of the text on up/down.
  onKeyDown: function(event) {
    console.log(event.nativeEvent);
    if (event.nativeEvent.keyCode == 40) {  // Down
      var before = this.props.todo.props.todoObj.val.before;
      if (before) {
        $("#" + before + "-text").focus();
      }
      event.preventDefault();
    } else if (event.nativeEvent.keyCode == 38) { // Up
      var after = this.props.todo.props.todoObj.val.after;
      if (after) {
        $("#" + after + "-text").focus();
      }
    } else if (event.nativeEvent.keyCode == 13 &&
        event.nativeEvent.shiftKey) {  //  Shift + Enter
      event.preventDefault();
      this.props.todo.props.todoList.addChild(this.props.todoKey);
    } else if (event.nativeEvent.keyCode == 13) { // Enter
      event.preventDefault();
      var text = $("#" + this.props.todoKey + "-text").text();
      if (text) {
        var offset = window.getSelection().baseOffset;
        var first = text.substring(0, offset);
        var second = text.substring(offset);
        this.props.todo.props.todoList.addAfter(
          this.props.todoKey, first, second);
      }
    } else if (event.nativeEvent.keyCode == 27) { // Escape
      $("#" + this.props.todoKey + "-text").blur();
      window.getSelection().removeAllRanges();
    } else if (event.nativeEvent.keyCode == 8) {  // Backspace
      var after = this.props.todo.props.todoObj.val.after;
      if (after && !$("#" + this.props.todoKey + "-text").text()) {
        this.props.todo.markDeleted(true);
        event.preventDefault();
      }
    }
  },
  render: function() {
    return (
      React.createElement("span", {
        onBlur: this.onTextBlur, 
        onKeyDown: this.onKeyDown, 
        id: this.props.todoKey + "-text", 
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
    this.ref = new Firebase(this.props.listPath + "/" + this.props.todoKey + "/deleted");
  },
  onClick: function() {
    this.props.todo.markDeleted(false);
  },
  render: function() {
    return (
      React.createElement("button", {
        onClick: this.onClick, type: "button", 
        className: "close todo-delete", "aria-label": "Close"}, 
        React.createElement("span", {
          "aria-hidden": "true", 
          dangerouslySetInnerHTML: {__html: '&times;'}})
      )
    );
  },
});

var TodoHandle = React.createClass({displayName: "TodoHandle",
  render: function() {
    return (
      React.createElement("span", {className: "todo-handle glyphicon glyphicon-option-vertical"})
    );
  },
});

var Todo = React.createClass({displayName: "Todo",
  getInitialState: function() {
    return {};
  },
  markDeleted: function(goToPrev) {
    this.props.todoList.markDeleted(this.props.todoObj, goToPrev);
  },
  setDone: function(done) {
    this.setState({
      done: done
    });
  },
  setText: function(text) {
    this.setState({
      text: text,
    });
  },
  setIsEmpty: function(isEmpty) {
    this.props.todoList.setIsEmpty(this.props.todoObj, isEmpty);
  },
  render: function() {
    var doneClass = this.state.done ? "todo-done" : "todo-not-done";
    var notEmptyLast = (this.props.todoObj.val.before || this.state.text);
    var todoDelete = notEmptyLast ?
      React.createElement(TodoDelete, {todo: this, todoKey: this.props.todoKey, 
        listPath: this.props.listPath}) : null;
    var todoHandle = notEmptyLast ? React.createElement(TodoHandle, null) : null;
    var sortableClass = notEmptyLast ? "sortable-todo" : "";
    return (
      React.createElement("li", {
        id: this.props.todoKey, 
        className: "list-group-item todo " + doneClass + " " + sortableClass}, 
        todoHandle, 
        React.createElement(TodoCheck, {todo: this, todoKey: this.props.todoKey, 
          listPath: this.props.listPath}), 
        React.createElement(TodoText, {todo: this, todoKey: this.props.todoKey, 
          listPath: this.props.listPath}), 
        todoDelete
      )
    );
  }
});

var TodoList = React.createClass({displayName: "TodoList",
  getInitialState: function() {
    this.listPath = fb + "/react_todos/" + this.props.uid + "/" + this.props.listKey;
    this.todos = [];
    return {todos: this.todos};
  },
  componentWillMount: function() {
    this.ref = new Firebase(this.listPath);
    
    // Add an empty todo if none currently exist.
    this.ref.on("value", function(snap) {
      if (snap.val() === null) {
        this.ref.push({
          text: "",
          after: "",
          before: "",
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
          after: "",
          before: "",
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
  componentDidMount: function() {
    var that = this;
    $("#todo-list").sortable({
      handle: ".todo-handle",
      items: "> .sortable-todo",
      update: function (event, ui) {
        todoMap = that.getTodoMap();
        var ids = $("#todo-list").sortable('toArray');
        ids.push(todoMap.last.k);

        var update = {};
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          var prevId = i > 0 ? ids[i - 1] : "";
          var nextId = (i < ids.length - 1) ? ids[i + 1] : "";
          var currentTodo = todoMap.map[id];
          if ((prevId != currentTodo.val.after) ||
              (nextId != currentTodo.val.before)) {
            update[id] = currentTodo.val;
            update[id].after = prevId;
            update[id].before = nextId;
          }
        }
        // Prevent actual reordering by the sortable. Let Firebase take care of it.
        $("#todo-list").sortable('cancel');
        that.ref.update(update);
      }
    });
  },
  componentWillUnmount: function() {
    this.ref.off();
  },
  markDeleted: function(todoObj, goToPrev) {
    var update = {};
    var beforeKey = todoObj.val.before;
    var afterKey = todoObj.val.after;
    var before;
    var after;
    for (var i = 0; i < this.todos.length; i++) {
      var todo = this.todos[i];
      if (beforeKey && todo.k === beforeKey) {
        before = todo;
      }
      if (afterKey && todo.k === afterKey) {
        after = todo;
      }
    }
    var thisVal = todoObj.val;
    thisVal.before = null;
    thisVal.after = null;
    thisVal.deleted = true;
    update[todoObj.k] = todoObj.val;
    if (before) {
      var beforeVal = before.val;
      if (after) {
        beforeVal.after = after.k;
      } else {
        beforeVal.after = null;
      }
      update[before.k] = beforeVal;
    }
    if (after) {
      var afterVal = after.val;
      if (before) {
        afterVal.before = before.k;
      } else {
        afterVal.before = null;
      }
      update[after.k] = afterVal;
      if (goToPrev) {
        this.focusKey = after.k;
      }
    }
    this.ref.update(update);
  },
  setIsEmpty: function(todo, isEmpty) {
    if (todo.val.before === "" && !isEmpty) {
      var pushedRef = this.ref.push({
        text: "",
        after: todo.k,
        before: "",
      });
      var update = {};
      update[todo.k] = todo.val
      update[todo.k].before = pushedRef.key();
      this.ref.update(update);
    }
  },
  getTodoMap: function() {
    var idToTodo = {};
    var firstTodoByParent = {};
    var lastTodoByParent = {};
    for (var i = 0; i < this.todos.length; i++) {
      var todo = this.todos[i];
      var parent = todo.val.parent ? todo.val.parent : null;
      if (!(parent in firstTodoByParent)) {
        firstTodoByParent[parent] = null;
        lastTodoByParent[parent] = null;
      }
      if (!todo.val.deleted) {
        idToTodo[todo.k] = todo;
        if (!todo.val.after) {
          firstTodoByParent[parent] = todo;
        }
        if (!todo.val.before) {
          lastTodoByParent[parent] = todo;
        }
      }
    }
    return {
      map: idToTodo,
      firsts: firstTodoByParent,
      lasts: firstTodoByParent,
    };
  },
  addChild: function(todoKey) {

  },
  addAfter: function(todoKey, first, second) {
    var todoMap = this.getTodoMap();
    var currentTodo = todoMap.map[todoKey];
    var oldBefore = todoMap.map[currentTodo.val.before];
    if (oldBefore && !oldBefore.val.text && !second) {
      $("#" + oldBefore.k + "-text").focus();
      return;
    }

    var newTodoKey = this.ref.push({
      text: "",
      deleted: true,
    }).key();
    var update = {};
    var currentBefore = currentTodo.val.before;
    update[currentTodo.k] = currentTodo.val;
    update[currentTodo.k].before = newTodoKey;
    update[currentTodo.k].text = first;
    update[newTodoKey] = {
      text: second,
      after: currentTodo.k,
      before: currentBefore,
      deleted: null,
    };
    if (oldBefore) {
      update[oldBefore.k] = oldBefore.val;
      update[oldBefore.k].after = newTodoKey;
    }
    this.focusKey = newTodoKey;
    this.ref.update(update);
  },
  componentDidUpdate: function() {
    if (this.focusKey) {
      $("#" + this.focusKey + "-text").focus();
      this.focusKey = undefined;
    }
  },
  render: function() {
    this.todos = this.state.todos;  // Is this guaranteed already?
    var todoMap = this.getTodoMap();
    console.log(todoMap);
    var todos = [];
    var todo = todoMap.firsts[null];
    var cutoff = 10000;
    while (todo && cutoff > 0) {
      todos.push(todo);
      todo = todoMap.map[todo.val.before];
      cutoff--;
    }
    if (cutoff == 0) {
      console.log("Aborted due to infinite loop.");
    }
    var undeletedTodos = todos.filter(function(todo) {
      return !todo.val.deleted;
    });
    var todoList = this;
    var todos = undeletedTodos.map(function (todo, i) {
      var todoElement = (
        React.createElement(Todo, {key: todo.k, todoList: todoList, 
          todoObj: todo, todoKey: todo.k, 
          listPath: this.listPath})
      );
      return todoElement;
    }.bind(this));
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
  componentWillUnmount: function() {
    this.ref.off();
  },
  authHandler: function(authData) {
    this.replaceState({
      authed: !!authData
    });
  },
  componentWillMount: function() {
    this.ref = new Firebase(fb);
    this.ref.onAuth(this.authHandler);
  },
  logoutOnClick: function(event) {
    this.ref.unauth();
    event.preventDefault();
  },
  render: function() {
    var leftLinks = null;
    var logoutButton = null;
    if (this.state.authed) {
      leftLinks = (
        React.createElement("li", null, 
          React.createElement("a", {onClick: this.props.app.navOnClick({page: "LISTS"}), 
             href: "/#/lists"}, 
              "Lists"
          )
        )
      );
      logoutButton = (
        React.createElement("li", null, React.createElement("a", {onClick: this.logoutOnClick, href: "#"}, "Logout"))
      );
    }
    return (
      React.createElement("nav", {className: "navbar navbar-default navbar-static-top"}, 
        React.createElement("div", {className: "container"}, 
          React.createElement("div", {className: "navbar-header"}, 
            React.createElement("a", {onClick: this.props.app.navOnClick({page: "LISTS"}), className: "navbar-brand", href: "/#/lists"}, "Firebase Todo")
          ), 
          React.createElement("ul", {className: "nav navbar-nav"}, 
            leftLinks
          ), 
          React.createElement("ul", {className: "nav navbar-nav navbar-right"}, 
            logoutButton
          )
        )
      )
    );
  },
});

var Login = React.createClass({displayName: "Login",
  componentWillUnmount: function() {
    this.ref.off();
  },
  authHandler: function(error, authData) {
    if (authData) {
      this.props.app.goToState(this.props.nextState, true);
    }
  },
  onAuthHandler: function(authData) {
    this.authHandler(null, authData);
  },
  componentWillMount: function() {
    this.ref = new Firebase(fb);
    // HACK: Weird stuff happens if we replace the state of the App from
    // componentWillMount, so schedule adding the onAuth listener
    // until slightly later so this doesn't occur synchronously.
    setTimeout(function() {
      this.ref.onAuth(this.onAuthHandler);
    }.bind(this), 0);
  },
  loginWithGoogle: function() {
    this.ref.authWithOAuthPopup("google", this.authHandler);
  },
  render: function() {
    return (
      React.createElement("button", {onClick: this.loginWithGoogle, className: "btn btn-default"}, 
        "Login with Google"
      )
    );
  },
});

var App = React.createClass({displayName: "App",
  componentWillUnmount: function() {
    this.ref.off();
  },
  getInitialState: function() {
    var state = this.getState();
    this.setHistory(state, true);
    return state;
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
    } else if (state.page === "LOGIN") {
      console.log("Pushing login state");
      histFunc(state, "", "#/login");
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
      res = path.match(/login$/);
      if (res) {
        return {
          page: "LOGIN",
          nextState: {
            page: "LISTS"
          },
        }
      }
    }
    return {
      page: "LISTS"
    }
  },
  componentWillMount: function() {
    this.ref = new Firebase(fb);
    this.redirectToLoginIfNecessary();
    this.ref.onAuth(function(authData) {
      console.log("App.onAuth");
      this.redirectToLoginIfNecessary();
    }.bind(this));

    // Register history listeners.
    var app = this;
    window.onpopstate = function(event) {
      app.replaceState(event.state);

      // If not authed, push the state back onto the history stack, and
      // redirect to login.
      var authData = app.ref.getAuth();
      if (!authData) {
        console.log("Pushing LOGIN onto stack.");
        app.redirectToLoginIfNecessary();
      }
    };
  },
  redirectToLoginIfNecessary: function() {
    var authData = this.ref.getAuth();
    if (!authData && this.state.page != "LOGIN") {
      console.log("redirecting to login");
      var loginState = {
        page: "LOGIN",
        nextState: this.state,
      };
      this.goToState(loginState, false);
    }
  },
  goToState: function(state, replace) {
    var authData = this.ref.getAuth();
    if (authData || state.page == "LOGIN") {
      this.setHistory(state, replace);
      this.replaceState(state);
    }
  },
  navOnClick: function(state) {
    return function(event) {
      this.goToState(state, false);
      // Prevent weird persistent highlighting.
      event.target.blur();
      event.preventDefault();
    }.bind(this);
  },
  getPage: function() {
    var authData = this.ref.getAuth();
    if (this.state.page === "LIST") {
      return (
        React.createElement(ListPage, {app: this}, 
          React.createElement(TodoList, {listKey: this.state.todoListKey, uid: authData.uid})
        )
      );
    } else if (this.state.page === "LISTS") {
      return (
        React.createElement(ListsPage, {app: this, uid: authData.uid})
      );
    } else if (this.state.page === "LOGIN") {
      return (
        React.createElement(Login, {app: this, nextState: this.state.nextState})
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