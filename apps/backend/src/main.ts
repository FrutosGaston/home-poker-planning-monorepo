import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });

  // Simple health check endpoint
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  const config = new DocumentBuilder()
    .setTitle('Home Poker Planning API')
    .setDescription('REST API for the Planning Poker app')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
