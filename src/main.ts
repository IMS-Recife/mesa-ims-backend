import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as helmet from 'helmet'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT')

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    errorHttpStatusCode: 422
  }))

  const config = new DocumentBuilder().setTitle('IMS').setVersion('1.0').build()

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.use(helmet())
  app.enableCors()

  await app.listen(port)
}

bootstrap()
