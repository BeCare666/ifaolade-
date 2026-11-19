import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Staff } from '../common/auth';

const FOLDERS = ['ifaolade/site', 'ifaolade/programs', 'ifaolade/events', 'ifaolade/articles', 'ifaolade/ebo-proofs'];

/** Upload signé : l'API signe, le navigateur envoie directement le fichier à Cloudinary. */
@Staff()
@Controller('admin/media')
export class MediaController {
  constructor(private cfg: ConfigService) {}

  @Get('signature')
  signature(@Query('folder') folder = 'ifaolade/site') {
    if (!FOLDERS.includes(folder)) throw new BadRequestException('Dossier non autorisé');
    const secret = this.cfg.get<string>('CLOUDINARY_API_SECRET');
    const apiKey = this.cfg.get<string>('CLOUDINARY_API_KEY');
    const cloudName = this.cfg.get<string>('CLOUDINARY_CLOUD_NAME');
    if (!secret || !apiKey || !cloudName) throw new BadRequestException('Cloudinary non configuré');
    const timestamp = Math.round(Date.now() / 1000);
    // Les preuves d'ebo sont « authenticated » : accessibles uniquement par URL signée.
    const params: Record<string, string | number> = { folder, timestamp };
    if (folder === 'ifaolade/ebo-proofs') params.type = 'authenticated';
    const signature = cloudinary.utils.api_sign_request(params, secret);
    return { ...params, signature, apiKey, cloudName };
  }
}
