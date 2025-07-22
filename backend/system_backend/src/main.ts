// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  // This allows your frontend (e.g., running on localhost:3001 or 5173)
  // to make requests to your backend (localhost:3000).
  // In a production environment, you should restrict 'origin' to your actual frontend URL.
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true, // Allow cookies to be sent with requests (if you use them for auth)
  });

  // Enable global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, 
      transform: true, 
    }),
  );

  const port = process.env.PORT || 3000; // Use port from environment variable or default to 3000
  await app.listen(port, () => {
    console.log(`NestJS application listening on port ${port}`);
  });
}
bootstrap();
