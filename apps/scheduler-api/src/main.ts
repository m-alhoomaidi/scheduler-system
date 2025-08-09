import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api')
  app.use(helmet());
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));
  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
      challenge: true,                       // sends WWW-Authenticate header
      users: {
        [process.env.SWAGGER_USER!]: process.env.SWAGGER_PASS!,
      },
    }),
  );
  const config = new DocumentBuilder()
  .setTitle('Scheduler API')
  .setVersion('1.0')
  .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'jwt')
  .build();


  const document = SwaggerModule.createDocument(app, config, { });
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });


  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

 
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Scheduler API is running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
