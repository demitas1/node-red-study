module.exports = function(RED) {
    function TimestampMergeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.latestTimestamp = null;

        node.on('input', function(msg, send, done) {
            send = send || function() { node.send.apply(node, arguments); };
            done = done || function(err) { if (err) node.error(err, msg); };

            if (msg.topic === 'timestamp' || msg._port === 0) {
                node.latestTimestamp = msg.payload;
                node.status({fill:"green", shape:"dot", text:"timestamp updated"});
                done();
            }
            else if (msg.topic === 'string' || msg._port === 1) {
                if (node.latestTimestamp !== null) {
                    var outputMsg = {
                        payload: {
                            timestamp: node.latestTimestamp,
                            text: msg.payload
                        }
                    };
                    send(outputMsg);
                    node.status({fill:"blue", shape:"dot", text:"sent"});
                } else {
                    node.warn("No timestamp available");
                }
                done();
            }
        });
    }

    RED.nodes.registerType("timestamp-merge", TimestampMergeNode);
}
