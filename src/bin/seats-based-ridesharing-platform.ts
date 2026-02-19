import app from "@/app.ts";
import createDebug from "debug";
import http, { Server } from "http";
import "dotenv/config";
import { configureSockets } from "@/config/socket";

const debug = createDebug("seats-based-ridesharing-platform:server");

const port = normalizePort(process.env.PORT);
app.set("port", port);

const server: Server = http.createServer(app);
const io = configureSockets(server)
app.set('io', io)

server.listen(port, () => console.log(`🚀 Server Running on Port: ${port}`));
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val?: string): number | string | false {
  if (!val) return 3000;
  const parsed = parseInt(val, 10);

  if (isNaN(parsed)) {
    return val;
  }

  if (parsed >= 0) {
    return parsed;
  }

  return false;
}

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== "listen") throw error;

  const bind =
    typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);

    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);

    default:
      throw error;
  }
}

function onListening(): void {
  const addr = server.address();

  let bind: string;

  if (typeof addr === "string") {
    bind = `pipe ${addr}`;
  } else if (addr && typeof addr === "object") {
    bind = `port ${addr.port}`;
  } else {
    bind = "unknown";
  }

  debug(`Listening on ${bind}`);
}
