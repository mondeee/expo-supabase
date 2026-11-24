import { supabase } from '@/lib/supabase';

export async function uploadAvatar(userId: string, localUri: string, contentType: string) {
  const response = await fetch(localUri);
  if (!response.ok) throw new Error('Could not read the selected image.');

  const fileBuffer = await response.arrayBuffer();
  const extension = contentType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const filePath = `${userId}/${Date.now()}.${extension}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true
    });

  if (error) throw error;

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('avatars')
    .createSignedUrl(data.path, 60 * 60);

  if (signedUrlError) throw signedUrlError;

  return {
    path: data.path,
    signedUrl: signedUrlData.signedUrl
  };
}
