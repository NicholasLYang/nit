"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const tslib_1 = require("tslib");
/**
 * Job server for nit. Responds to GitHub webhooks and issues jobs on fly.io
 *
 */
const fastify_1 = tslib_1.__importDefault(require("fastify"));
const server = (0, fastify_1.default)({ logger: true });
server.get("/", () => {
    return { messgae: "Welcome to the nit API" };
});
async function startServer() {
    try {
        await server.listen({ port: 3000 });
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}
exports.startServer = startServer;
