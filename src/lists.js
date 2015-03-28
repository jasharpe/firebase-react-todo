var ListsEntry = React.createClass({
  onClick: function() {
    return this.props.app.navOnClick({page: "LIST", todoListKey: this.props.listKey});
  },
  render: function() {
    return (
      <li id={this.props.listKey} className="list-group-item">
        <a onClick={this.onClick()} href={"/#/list/" + this.props.listKey}>{this.props.listKey}</a>
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
  },
  createNewList: function(event) {
    this.ref.push({
      title: "",
    });
    event.preventDefault();
  },
  render: function() {
    var lists = this.state.lists;
    console.log(lists);
    var undeletedLists = lists.filter(function(list) {
      return !list.val.deleted;
    });
    console.log(undeletedLists);
    var renderedLists = undeletedLists.map(function (list, i) {
      return (
        <ListsEntry key={list.k} app={this.props.app} listKey={list.k} />
      );
    }.bind(this));
    return (
      <div>
        <button onClick={this.createNewList} type="button"
          className="btn btn-primary">
          New List
        </button>
        <ul id="lists" className="list-group">
          {renderedLists}
        </ul>
      </div>
    );
  },
});