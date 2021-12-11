import React, { render, Component } from "./react";

const root = document.getElementById("root");

// const jsx = (
//   <div>
//     <p>Hello React</p>
//     <p>Goodbye React</p>
//   </div>
// );
//
// render(jsx, root);

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

function Greeting(props) {
  return <div>{props.title} hahaha</div>;
}

render(<Greeting title={"Hello"} />, root);
