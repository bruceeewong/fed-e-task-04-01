import { scheduleUpdate } from "../reconciliation";

export default class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
  }

  setState(partialState) {
    scheduleUpdate(this, partialState);
  }
}
