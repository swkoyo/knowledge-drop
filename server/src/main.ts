import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get<ConfigService>(ConfigService);

    app.setGlobalPrefix(config.get<string>('GLOBAL_PREFIX') as string);
    app.useLogger(app.get<Logger>(Logger));
    app.enableCors();
    app.use(helmet());
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            enableDebugMessages: config.get('NODE_ENV') !== 'production'
        })
    );

    await app.listen(config.get<number>('PORT'));
}
bootstrap();
