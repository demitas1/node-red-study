import { Node, NodeDef, NodeAPI, NodeMessageInFlow } from 'node-red';

interface TimestampMergeNodeConfig extends NodeDef {
}

interface TimestampMergeNode extends Node {
  latestTimestamp: any;
}

interface OutputMessage {
  payload: {
    timestamp: any;
    text: any;
  };
}

module.exports = function(RED: NodeAPI) {
  function TimestampMergeNode(this: TimestampMergeNode, config: TimestampMergeNodeConfig) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.latestTimestamp = null;

    node.on('input', function(msg: NodeMessageInFlow, send: (msg: NodeMessageInFlow | NodeMessageInFlow[]) => void, done: (err?: Error) => void) {
      send = send || function() { node.send.apply(node, arguments as any); };
      done = done || function(err?: Error) { if (err) node.error(err, msg); };

      if (msg.topic === 'timestamp' || (msg as any)._port === 0) {
        node.latestTimestamp = msg.payload;
        node.status({fill:"green", shape:"dot", text:"timestamp updated"});
        done();
      }
      else if (msg.topic === 'string' || (msg as any)._port === 1) {
        if (node.latestTimestamp !== null) {
          const outputMsg: OutputMessage = {
            payload: {
              timestamp: node.latestTimestamp,
              text: msg.payload
            }
          };
          send(outputMsg as any);
          node.status({fill:"blue", shape:"dot", text:"sent"});
        } else {
          node.warn("No timestamp available");
        }
        done();
      }
    });
  }

  RED.nodes.registerType("timestamp-merge", TimestampMergeNode as any);
};
