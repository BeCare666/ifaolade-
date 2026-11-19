import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

/** Plan étape 8.3 : refuser de démarrer en production avec une configuration dangereuse. */
function checkProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return;
  const problems: string[] = [];
  const secret = process.env.JWT_SECRET ?? '';
  if (secret.length < 32 || secret.includes('change-moi')) problems.push('JWT_SECRET doit faire au moins 32 caractères aléatoires');
  if (!process.env.DATABASE_URL?.includes('sslaccept=strict')) problems.push('DATABASE_URL doit imposer TLS (sslaccept=strict)');
  if (!process.env.WEB_URL?.startsWith('https://')) problems.push('WEB_URL doit être en https');
  if (!process.env.BREVO_API_KEY) problems.push('BREVO_API_KEY manquante (aucun email ne partirait)');
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_WEBHOOK_SECRET) problems.push('STRIPE_WEBHOOK_SECRET manquante');
  if (problems.length) {
    throw new Error(`Configuration de production invalide :\n- ${problems.join('\n- ')}`);
  }
}

async function bootstrap() {
  checkProductionConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.set('trust proxy', 1); // derrière le proxy de Render : bonne IP pour la limitation de débit
  app.use(helmet());
  app.enableCors({
    origin: (process.env.WEB_URL || 'http://localhost:3000').split(','),
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();
  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
  new Logger('Ifaôladé').log(`API prête sur le port ${port}`);
}
bootstrap();
