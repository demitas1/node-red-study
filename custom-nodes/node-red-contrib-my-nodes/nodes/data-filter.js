module.exports = function(RED) {
    function DataFilterNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.threshold = config.threshold || 0;

        node.on('input', function(msg, send, done) {
            send = send || function() { node.send.apply(node, arguments); };
            done = done || function(err) { if (err) node.error(err, msg); };

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

    RED.nodes.registerType("data-filter", DataFilterNode);
}
