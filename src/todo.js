var TodoCheck = React.createClass({
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

// TODO: fix copy and paste creating HTML entities.
var TodoText = React.createClass({
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
    this.ref = new Firebase(this.props.listPath + "/" + this.props.todoKey + "/deleted");
  },
  onClick: function() {
    this.props.todo.markDeleted(false);
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
      <TodoDelete todo={this} todoKey={this.props.todoKey}
        listPath={this.props.listPath} /> : null;
    var todoHandle = notEmptyLast ? <TodoHandle /> : null;
    var sortableClass = notEmptyLast ? "sortable-todo" : "";
    return (
      <li 
        id={this.props.todoKey}
        className={"list-group-item todo " + doneClass + " " + sortableClass}>
        {todoHandle}
        <TodoCheck todo={this} todoKey={this.props.todoKey}
          listPath={this.props.listPath} />
        <TodoText todo={this} todoKey={this.props.todoKey}
          listPath={this.props.listPath} />
        {todoDelete}
      </li>
    );
  }
});

var TodoListTitle = React.createClass({
  getInitialState: function() {
    this.title = "";
    return {
      title: this.title,
      editing: false,
    };
  },
  componentWillUnmount: function() {
    this.ref.off();
  },
  componentWillMount: function() {
    this.ref = new Firebase(this.props.metadataListPath + "/title");
    this.ref.on('value', function(snap) {
      this.title = snap.val() ? snap.val() : "";
      this.setState({
        title: this.title,
      });
    }.bind(this));
  },
  componentDidUpdate: function() {
    var editor = $("#list-title-editor");
    if (editor) {
      editor.text(this.title);
    }
  },
  editTitle: function(event) {
    event.preventDefault();
    this.setState({
      editing: true,
    });
  },
  render: function() {
    if (this.state.editing) {
      return (
        <div id="list-title-container">
          <h1 id="list-title-editor" contentEditable="plaintext-only"></h1>
        </div>
      );
    } else {
      return (
        <div id="list-title-container">
          <h1 id="list-title">{this.state.title}</h1>
          <a
            onClick={this.editTitle}
            id="edit-title"
            href="#">
            <span
              className="glyphicon glyphicon-pencil">
            </span>
          </a>
        </div>
      );
    }
  },
});

var TodoList = React.createClass({
  getInitialState: function() {
    this.listPath = fb + "/react_todos/" + this.props.uid + "/" + this.props.listKey;
    this.metadataListPath = fb + "/react_lists/" + this.props.uid + "/" + this.props.listKey;
    this.todos = [];
    this.title = "";
    return {
      todos: this.todos,
      title: this.title,
    };
  },
  componentWillMount: function() {
    this.ref = new Firebase(this.listPath);
    this.metadataRef = new Firebase(this.metadataListPath);

    this.metadataRef.once('value', function(snap) {
      if (snap.val() === null) {
        // This list doesn't exist (i.e. wasn't created), so redirect to lists.
        // Since this is a redirect, replace state.
        this.props.app.goToState({page: 'LISTS'}, true);
      } else {
        this.registerListeners();
      }
    }.bind(this));
  },
  registerListeners: function() {
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
        todos: this.todos,
      });
    }.bind(this));

    this.ref.on("child_changed", function(childSnap) {
      var key = childSnap.key();
      for (var i = 0; i < this.todos.length; i++) {
        if (this.todos[i].k == key) {
          this.todos[i].val = childSnap.val();
          this.setState({
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
    this.metadataRef.off();
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
        <Todo key={todo.k} todoList={todoList}
          todoObj={todo} todoKey={todo.k}
          listPath={this.listPath} />
      );
      return todoElement;
    }.bind(this));
    return (
      <div>
        <TodoListTitle metadataListPath={this.metadataListPath} />
        <ul id="todo-list" className="list-group">
          {todos}
        </ul>
      </div>
    );
  }
});