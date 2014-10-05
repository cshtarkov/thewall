var fs = require("fs");
var WebSocketServer = require("ws").Server;

wss = new WebSocketServer({port: 81});

wss.broadcast = function(data) {
    for(var c in this.clients) {
        this.clients[c].send(data);
    }
};

wss.on("connection", function(ws) {
    ws.on("message", function(data) {
        var message = JSON.parse(data);
        if(message.type == "probe") {
            wss.broadcast("live");
        }
        if(message.type == "coords") {
            wss.broadcast(data);
        }
        if(message.type == "save") {
            var image = message.image;
            image = image.substring(21);
            var binary = new Buffer(image, "base64").toString("binary");
            fs.writeFile("wall.png", binary, "binary", function(err) {
                if(err!=null) console.log(err);
            });
        }
    });
});

