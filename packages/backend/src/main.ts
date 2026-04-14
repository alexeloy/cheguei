import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { UPLOAD_DIR } from './config/upload.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false, // desativa o cors interno — vamos controlar manualmente
  });

  // Middleware de CORS manual — roda antes de qualquer rota, inclusive OPTIONS
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Accept, Authorization, X-Requested-With',
    );
    res.setHeader('Access-Control-Max-Age', '86400'); // cache do preflight por 24h

    // Preflight: responde imediatamente com 200 sem passar pelo NestJS
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  app.useStaticAssets(UPLOAD_DIR, { prefix: '/uploads' });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend em http://localhost:${port}`);
  console.log(`📁 Uploads em: ${UPLOAD_DIR}`);
}
bootstrap();
