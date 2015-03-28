var fb = "https://glaring-fire-5349.firebaseio.com";

var App = React.createClass({
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
      // TODO: get uid corresponding to list id owner.
      return (
        <ListPage app={this}>
          <TodoList app={this} listKey={this.state.todoListKey} uid={authData.uid} />
        </ListPage>
      );
    } else if (this.state.page === "LISTS") {
      return (
        <ListsPage app={this} uid={authData.uid} />
      );
    } else if (this.state.page === "LOGIN") {
      return (
        <Login app={this} nextState={this.state.nextState} />
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