var ListsEntry = React.createClass({
  onClick: function() {
    return this.props.app.navOnClick({page: "LIST", todoListKey: this.props.listKey});
  },
  render: function() {
    return (
      <li onClick={this.onClick()} id={this.props.listKey} className="list-entry list-group-item">
        <span>{this.props.listVal.title}</span>
      </li>
    );
  },
});

var ListsPage = React.createClass({
  getInitialState: function() {
    this.lists = [];
    return {lists: this.lists};
  },
  componentWillUnmount: function() {
    this.ref.off();
  },
  componentWillMount: function() {
    this.ref = new Firebase(fb + "/react_lists/" + this.props.uid);
    
    this.ref.on("child_added", function(childSnap) {
      this.lists.push({
        k: childSnap.key(),
        val: childSnap.val()
      });
      this.replaceState({
        lists: this.lists
      });
    }.bind(this));

    this.ref.on("child_removed", function(childSnap) {
      var key = childSnap.key();
      var i;
      for (i = 0; i < this.lists.length; i++) {
        if (this.lists[i].k == key) {
          break;
        }
      }
      this.lists.splice(i, 1);
      this.setState({
        lists: this.lists,
      });
    }.bind(this));

    this.ref.on("child_changed", function(childSnap) {
      var key = childSnap.key();
      for (var i = 0; i < this.lists.length; i++) {
        if (this.lists[i].k == key) {
          var oldTitle = this.lists[i].val.title;
          this.lists[i].val = childSnap.val();
          this.setState({
            lists: this.lists,
          });
        }
      }
    }.bind(this));
  },
  createNewList: function(event) {
    var pushedRef = this.ref.push({
      title: "",
      lastModified: Date.now(),
    });
    this.props.app.goToState({
      page: "LIST",
      todoListKey: pushedRef.key(),
    }, false);
    event.preventDefault();
  },
  render: function() {
    var lists = this.state.lists;
    var undeletedLists = lists.filter(function(list) {
      return !list.val.deleted;
    });
    // Order so that the most recent list comes first.
    undeletedLists.sort(function (a, b) {
      return b.val.lastModified - a.val.lastModified;
    });
    var renderedLists = undeletedLists.map(function (list, i) {
      return (
        <ListsEntry key={list.k} app={this.props.app} listKey={list.k} listVal={list.val} />
      );
    }.bind(this));
    return (
      <div>
        <button onClick={this.createNewList} type="button"
          className="btn btn-primary">
          New List
        </button>
        <div className="page-header">
          <ul id="lists" className="list-group">
            {renderedLists}
          </ul>
        </div>
      </div>
    );
  },
});