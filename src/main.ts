import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('discord-nest')
    .setDescription("The API documentation for 'discord-nest' - Semih Berkay Ozturk")
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/swagger', app, document, {
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
    },
  });

  if (process.env.CORS_ENABLE) {
    app.enableCors({
      origin: origin.length === 0 ? '*' : origin,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      //add more options
    });
  } else {
    app.enableCors();
  }
  await app.listen(3000);
  console.log(process.env.NODE_ENV);
}
bootstrap();
