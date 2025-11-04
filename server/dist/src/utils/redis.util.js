"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const redis_1 = require("redis");
exports.redis = (0, redis_1.createClient)()
    .on('error', (err) => console.log('Redis client error', err))
    .connect();
//# sourceMappingURL=redis.util.js.map