"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const fs = require("fs");
const upload_config_1 = require("./config/upload.config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: false,
    });
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
        res.setHeader('Access-Control-Max-Age', '86400');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    if (!fs.existsSync(upload_config_1.UPLOAD_DIR)) {
        fs.mkdirSync(upload_config_1.UPLOAD_DIR, { recursive: true });
    }
    app.useStaticAssets(upload_config_1.UPLOAD_DIR, { prefix: '/uploads' });
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Backend em http://localhost:${port}`);
    console.log(`📁 Uploads em: ${upload_config_1.UPLOAD_DIR}`);
}
bootstrap();
//# sourceMappingURL=main.js.map