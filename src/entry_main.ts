import {
  allComponents,
  provideFluentDesignSystem,
} from "@fluentui/web-components";
import { SocketCanvasElement } from "./socket_canvas.js";
// Make everything use microsoft fluent by default.
provideFluentDesignSystem().register(allComponents);

/* 

Useful types (you don't have to use them explicitly, 
they serve as documentation for what the protocol is doing) 

*/

interface Point {
  x: number,
  y: number,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WelcomeMessage {
  // The size of the remote canvas.
  x: number,
  y: number,
  data: [number]
}

interface UpdateMessage {
  point: Point,
  value: boolean,
}

// Create a websocket connection. 
// More info at https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
const socket = new WebSocket("ws:socket.zavazadlo.unsigned-short.com");
const canvas = new SocketCanvasElement();
canvas.ondraw = (x,y) => {
  socket.send(JSON.stringify({
    point: {"x": x, "y": y},
    value: true
  }));
  canvas.setPixel(x, y, true);
}

// Poll for new updates
socket.onopen = () => {
  setInterval(() => {
    setTimeout(() => {
      socket.send(JSON.stringify({
        point: {"x": 0, "y": 0},
        value: false
      }));
    });
  }, 500);
}

socket.onmessage = (m) => {
  const data = JSON.parse(m.data);
  if (canvas.width === null) {
    canvas.width = data.x;
    canvas.height = data.y;
    document.querySelector("#container")!.appendChild(canvas);

    // We can only draw into canvas once it is actually shown, hence we postpose the draw operation.
    setTimeout(() => {
      for (let x = 0; x < data.x; x++) {
        for (let y = 0; y < data.y; y++) {
          if (data.data[x * data.x + y] === 1) {
            canvas.setPixel(x, y, true);
          }
        }
      }
    })
  }
  else {
    data.forEach((update: UpdateMessage) => {
      canvas.setPixel(update.point.x, update.point.y, update.value);
    })
  }
}