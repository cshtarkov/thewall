$(document).ready(function() {
    
    $("body").on("contextmenu", "#wall", function(e) {
        return false;
    });

    var wall = $("#wall");

    wall.drawImage({
        source: "wall.png?nocache="+(new Date().getTime()),
        x: 400, y: 300,
        height: 600,
        width: 800
    });

    var ws = new WebSocket("ws://wall.shtarkov.net:81/server.js");
    ws.onopen = function() {

        var notifying = false;
        var originx, originy;


        function line(x1, y1, x2, y2, mode) {
            wall.drawLine({
                strokeStyle: (mode=="mark")?"#000":"#fff",
                strokeWidth: (mode=="mark")?2:30,
                x1: x1, y1: y1,
                x2: x2, y2: y2
            });
        }

        function notify(x, y, mode) { 
            x1 = originx - wall.offset().left;
            y1 = originy - wall.offset().top;
            x2 = x - wall.offset().left;
            y2 = y - wall.offset().top;

            ws.send(JSON.stringify({type: "coords", x1: x1, y1: y1, x2: x2, y2: y2, mode: mode}));
            line(x1, y1, x2, y2, mode);

            originx = x;
            originy = y;
        };


        wall.mousedown(function() {
            notifying = true;
            originx = event.pageX;
            originy = event.pageY;
        });

        wall.mousemove(function(event) {
            if(notifying) {
                notify(event.pageX, event.pageY, (event.which==1)?"mark":"erase");
            }
        });

        $("body").mouseup(function() {
            notifying = false;
            ws.send(JSON.stringify({type: "save", image: wall.getCanvasImage("png")}));
        });

        ws.onmessage = function(event) {
            var message = JSON.parse(event.data);
            if(message.type == "coords") {
                var coords = message;
                line(coords.x1, coords.y1, coords.x2, coords.y2, coords.mode);
            }
        };

    };

});
