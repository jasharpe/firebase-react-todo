var Login = React.createClass({
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
      <button onClick={this.loginWithGoogle} className="btn btn-default">
        Login with Google
      </button>
    );
  },
});