import Hapi from "@hapi/hapi";
import { Server as SocketServer } from "socket.io";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    io: SocketServer;
  }
}

const socketPlugin: Hapi.Plugin<{ allowedOrigin: string }> = {
  name: "socket",
  register: async function (server: Hapi.Server, options) {
    const io = new SocketServer(server.listener, {
      cors: {
        origin: options.allowedOrigin,
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId as string;
      console.log("NEW SOCKET CONNECTION", userId);
      socket.join(userId);
      socket.to(userId).emit("WELCOME");

      socket.on("disconnect", () => {
        console.log("SOCKET DISCONNECTION", userId);
      });
    });

    server.app.io = io;

    server.ext({
      type: "onPostStop",
      method: async (server: Hapi.Server) => {
        server.app.io.close();
      },
    });
  },
};

export default socketPlugin;
