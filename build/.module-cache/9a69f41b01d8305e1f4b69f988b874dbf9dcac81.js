var Todo = React.createClass({displayName: "Todo",
  render: function() {
    return React.createElement("h1", null, "Hello, world!");
  }
});

React.render(
  React.createElement(Todo, null),
  document.getElementById('container')
);