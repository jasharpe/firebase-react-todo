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