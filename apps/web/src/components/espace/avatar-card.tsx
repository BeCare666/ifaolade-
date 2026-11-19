'use client';

import { Camera, Trash2 } from 'lucide-react';
import { CloudinaryUpload } from '@/components/admin/editors';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/toast';
import { UserAvatar } from '@/components/ui/user-avatar';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';

/** REFONTE §7 : ma photo. Cloudinary la recadre en carré sur le visage (400 × 400), imposé par la signature de l'API. */
export function AvatarCard() {
  const { user, token, refresh } = useAuth();
  const toast = useToast();
  if (!user) return null;
  const name = `${user.firstName} ${user.lastName ?? ''}`.trim();
  return (
    <Card>
      <CardHeader title="Ma photo" description="Visible par toi et par le prêtre uniquement." />
      <div className="flex flex-col items-center gap-5 p-5 sm:flex-row">
        <span className="relative">
          <UserAvatar name={name} src={user.avatarUrl} size={96} />
          <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-osun text-kaolin ring-2 ring-surface"><Camera size={14} /></span>
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <CloudinaryUpload
            folder="ifaolade/avatars" signaturePath="/me/avatar/signature" accept="image/jpeg,image/png,image/webp"
            label={user.avatarUrl ? 'Changer ma photo' : 'Ajouter ma photo'} token={token}
            onUploaded={async ({ url }) => {
              try { await apiSend('/me/avatar', { url }, 'PUT', token); await refresh(); toast('Photo enregistrée'); }
              catch (e) { toast((e as Error).message, 'error'); }
            }}
          />
          {user.avatarUrl && (
            <Button variant="ghost" size="sm" shape="console" onClick={async () => {
              try { await apiSend('/me/avatar', undefined, 'DELETE', token); await refresh(); toast('Photo retirée'); }
              catch (e) { toast((e as Error).message, 'error'); }
            }}><Trash2 size={14} /> Retirer</Button>
          )}
          <p className="w-full text-center text-[12px] text-text-faint sm:text-left">JPG, PNG ou WebP. Recadrée automatiquement.</p>
        </div>
      </div>
    </Card>
  );
}
