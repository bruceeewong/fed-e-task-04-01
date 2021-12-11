import React, { render, Component } from "./react";

const root = document.getElementById("root");

const jsx = (
  <div>
    <div>Hello React</div>
    <p>Goodbye React</p>
  </div>
);

render(jsx, root);

setTimeout(() => {
  const jsx = (
    <div>
      <p>Goodbye React</p>
    </div>
  );

  render(jsx, root);
}, 2000);

// class Greeting extends Component {
//   constructor(props) {
//     super(props);
//   }
//
//   render() {
//     return <div>{this.props.title} hahaha</div>;
//   }
// }

// render(<Greeting title={'Hello'} />, root);

// function Greeting(props) {
//   return <div>{props.title} hahaha</div>;
// }
//
// render(<Greeting title={"Hello"} />, root);
