var fb = "https://glaring-fire-5349.firebaseio.com";

var TodoCheck = React.createClass({
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
      <a
        onClick={this.toggleCheck}
        href="#"
        className="pull-left todo-check">
        <span
          className="todo-check-mark glyphicon glyphicon-ok"
          aria-hidden="true">
        </span>
      </a>
    );
  },
});

var TodoText = React.createClass({
  componentWillUnmount: function() {
    this.ref.off();
  },
  setText: function(text) {
    this.text = text;
    this.props.todo.setText(text);
  },
  componentWillMount: function() {
    this.ref = new Firebase(fb + "/react_todos/" + this.props.todoKey + "/text");

    // Update the todo's text when it changes.
    this.setText("");
    this.ref.on("value", function(snap) {
      if (snap.val() !== null) {
        this.props.todo.setIsEmpty(snap.val() === "");
        $("#" + this.props.todoKey + "-text").text(snap.val());
        this.setText(snap.val());
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
  onKeyDown: function(event) {
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
    } else if (event.nativeEvent.keyCode == 13) { // Enter

    } else if (event.nativeEvent.keyCode == 27) { // Escape
      $("#" + this.props.todoKey + "-text").blur();
      window.getSelection().removeAllRanges();
    }
  },
  render: function() {
    return (
      <span
        onBlur={this.onTextBlur}
        onKeyDown={this.onKeyDown}
        id={this.props.todoKey + "-text"}
        contentEditable="plaintext-only"
        data-ph="Todo"
        className="todo-text">
      </span>
    );
  },
});

var TodoDelete = React.createClass({
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
    this.props.todo.markDeleted();
  },
  render: function() {
    return (
      <button
        onClick={this.onClick} type="button"
        className="close todo-delete" aria-label="Close">
        <span
          aria-hidden="true"
          dangerouslySetInnerHTML={{__html: '&times;'}}></span>
      </button>
    );
  },
});

var TodoHandle = React.createClass({
  render: function() {
    return (
      <span className="todo-handle glyphicon glyphicon-option-vertical"></span>
    );
  },
});

var Todo = React.createClass({
  getInitialState: function() {
    return {};
  },
  markDeleted: function() {
    this.props.todoList.markDeleted(this.props.todoObj);
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
      <TodoDelete todo={this} todoKey={this.props.todoKey} /> : null;
    var todoHandle = notEmptyLast ? <TodoHandle /> : null;
    var sortableClass = notEmptyLast ? "sortable-todo" : "";
    return (
      <li 
        id={this.props.todoKey}
        className={"list-group-item todo " + doneClass + " " + sortableClass}>
        {todoHandle}
        <TodoCheck todo={this} todoKey={this.props.todoKey} />
        <TodoText todo={this} todoKey={this.props.todoKey} />
        {todoDelete}
      </li>
    );
  }
});

var TodoList = React.createClass({
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
        console.log(ui);
        // TODO: figure out how to get the moved item and new position and such.
        // use beforeStop?
        var idToTodo = {};
        var lastTodo = null;
        for (var i = 0; i < that.todos.length; i++) {
          var todo = that.todos[i];
          if (!todo.val.deleted) {
            idToTodo[todo.k] = todo;
            lastTodo = todo;
          }
        }
        console.log(idToTodo);
        console.log(lastTodo);
        var ids = $("#todo-list").sortable('toArray');
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          var prevId = i > 0 ? ids[i - 1] : null;
          var nextId = i < ids.length - 1 ? ids[i + 1] : null;
          console.log(prevId + " " + id + " " + nextId);
        }
        // Prevent actual reordering by the sortable. Let Firebase take care of it.
        $("#todo-list").sortable('cancel');
      }
    });
  },
  componentWillUnmount: function() {
    this.ref.off();
  },
  markDeleted: function(todoObj) {
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
  render: function() {
    var undeletedTodos = this.state.todos.filter(function(todo) {
      return !todo.val.deleted;
    });
    var todoList = this;
    var todos = undeletedTodos.map(function (todo, i) {
      var todoElement = (
        <Todo key={todo.k} todoList={todoList} todoObj={todo} todoKey={todo.k} />
      );
      return todoElement;
    });
    return (
      <div>
        <h1 id="list_title">{this.props.title}</h1>
        <ul id="todo-list" className="list-group">
          {todos}
        </ul>
      </div>
    );
  }
});

var ListPage = React.createClass({
  render: function() {
    return (
      <div>
        <div id="list_page">
          <a
            onClick={this.props.app.navOnClick({page: "LISTS"})}
            href="/#/lists"
            id="lists_link"
            className="btn btn-primary">
              Back to Lists
          </a>
        </div>
        <div className="page-header">
          {this.props.children}
        </div>
      </div>
    );
  }
});

var Nav = React.createClass({
  render: function() {
    return (
      <nav className="navbar navbar-default navbar-static-top">
        <div className="container">
          <div className="navbar-header">
            <a onClick={this.props.app.navOnClick({page: "LISTS"})} className="navbar-brand" href="/#/lists">Firebase Todo</a>
          </div>
          <ul className="nav navbar-nav">
            <li><a onClick={this.props.app.navOnClick({page: "LISTS"})} href="/#/lists">Lists</a></li>
          </ul>
        </div>
      </nav>
    );
  },
});

var App = React.createClass({
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
        <ListPage app={this}>
          <TodoList todoListKey={this.state.todoListKey} />
        </ListPage>
      );
    } else if (this.state.page === "LISTS") {
      return (
        <a onClick={this.navOnClick({page: "LIST", todoListKey: "-JjcFYgp1LyD5oDNNSe2"})} href="/#/list/-JjcFYgp1LyD5oDNNSe2">hi</a>
      );
    } else {
      console.log("Unknown page: " + this.state.page);
    }
  },
  render: function() {
    return (
      <div>
        <Nav app={this} />
        <div className="container" role="main">
          {this.getPage()}
        </div>
      </div>
    );
  }
});

React.render(
  <App />,
  document.getElementById('content')
);