import "dotenv/config";

import http from "http";
import dns from "dns";
import app from "./app";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
import connectDatabase from "./config/database.config";
import { Env } from "./config/app.config";
import { initSocket } from "./socket";

const httpServer = http.createServer(app);

initSocket(httpServer)



httpServer.listen(Env.PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${Env.PORT} in ${Env.NODE_ENV}`);
  await connectDatabase();
});
