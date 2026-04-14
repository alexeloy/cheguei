"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOAD_DIR = void 0;
const path = require("path");
exports.UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));
//# sourceMappingURL=upload.config.js.map