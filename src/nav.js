var Nav = React.createClass({
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
        <li>
          <a onClick={this.props.app.navOnClick({page: "LISTS"})}
             href="/#/lists">
              Lists
          </a>
        </li>
      );
      logoutButton = (
        <li><a onClick={this.logoutOnClick} href="#">Logout</a></li>
      );
    }
    return (
      <nav className="navbar navbar-default navbar-static-top">
        <div className="container">
          <div className="navbar-header">
            <a onClick={this.props.app.navOnClick({page: "LISTS"})} className="navbar-brand" href="/#/lists">Firebase Todo</a>
          </div>
          <ul className="nav navbar-nav">
            {leftLinks}
          </ul>
          <ul className="nav navbar-nav navbar-right">
            {logoutButton}
          </ul>
        </div>
      </nav>
    );
  },
});