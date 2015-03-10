var Todo = React.createClass({displayName: "Todo",
  render: function() {
    return React.createElement("h1", null, "Hello, world!");
  }
});

React.render(
  React.createElement("h1", null, "Hello, world!"),
  document.getElementById('container')
);