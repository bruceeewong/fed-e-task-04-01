import React, { render } from "./react";

const root = document.getElementById("root");

const jsx = (
  <div>
    <p>Hello React</p>
    <p>Goodbye React</p>
  </div>
);

render(jsx, root);
