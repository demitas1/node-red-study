import { Node, NodeDef, NodeAPI, NodeMessageInFlow } from 'node-red';

interface DataFilterNodeConfig extends NodeDef {
  threshold: number;
}

interface DataFilterNode extends Node {
  threshold: number;
}

module.exports = function(RED: NodeAPI) {
  function DataFilterNode(this: DataFilterNode, config: DataFilterNodeConfig) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.threshold = config.threshold || 0;

    node.on('input', function(msg: NodeMessageInFlow, send: (msg: NodeMessageInFlow | NodeMessageInFlow[]) => void, done: (err?: Error) => void) {
      send = send || function() { node.send.apply(node, arguments as any); };
      done = done || function(err?: Error) { if (err) node.error(err, msg); };

      if (typeof msg.payload === 'number') {
        if (msg.payload > node.threshold) {
          send(msg);
          node.status({fill:"green", shape:"dot", text:`passed: ${msg.payload}`});
        } else {
          node.status({fill:"red", shape:"dot", text:`filtered: ${msg.payload}`});
        }
      } else {
        node.warn("Payload is not a number");
      }

      done();
    });
  }

  RED.nodes.registerType("data-filter", DataFilterNode as any);
};
