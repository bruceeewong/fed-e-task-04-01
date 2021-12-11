import React, { render, Component } from "./react";

const root = document.getElementById("root");

// const jsx = (
//   <div>
//     <div>Hello React</div>
//     <p>Goodbye React</p>
//   </div>
// );
// render(jsx, root);
//
// setTimeout(() => {
//   const jsx = (
//     <div>
//       <p>Goodbye React</p>
//     </div>
//   );
//
//   render(jsx, root);
// }, 2000);

class Greeting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "张三",
    };
  }

  render() {
    return (
      <div>
        {this.props.title} {this.state.name}
        <button onClick={() => this.setState({ name: "李四" })}>Button</button>
      </div>
    );
  }
}

render(<Greeting title={"Hello"} />, root);

// function Greeting(props) {
//   return <div>{props.title} hahaha</div>;
// }

// render(<Greeting title={"Hello"} />, root);
