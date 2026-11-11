import { DatabaseTableName } from "@/constant/database_table_name";
import { supabase } from "@/lib/supabase";
import { UpdateUserPayload } from "@/types/user_type";

export async function getDataUser(uid: string) {
  const { data, error } = await supabase
    .from(DatabaseTableName.usersCollection)
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('User data not found!');

  let avatarUrl: string | null = null;
  if (data.avatar_path) {
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.avatar_path);

    avatarUrl = publicUrlData.publicUrl;
  }

  return {
    ...data,
    avatarUrl,
  };
}


export async function updateDataUser(uid: string, payload: UpdateUserPayload) {
    const { data, error } = await supabase
        .from(DatabaseTableName.usersCollection)
        .update({
            fullname: payload.fullname,
            nickname: payload.nickname,
            phone: payload.phone,
            avatar_url: payload.avatar_url
        })
        .eq('id', uid)
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}

export const avatarService = {
  async replaceAvatar(userId: string, file: File, oldAvatarUrl?: string | null) {
    
    if (oldAvatarUrl) {
      await this.deleteAvatarByUrl(oldAvatarUrl)
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${Date.now()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl
  },

  async deleteAvatarByUrl(publicUrl: string) {
    try {
      const url = new URL(publicUrl)
      const pathParts = url.pathname.split('/avatars/')
      if (pathParts.length < 2) return

      const filePath = pathParts[1]

      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (error) {
        console.warn('Gagal hapus avatar lama:', error.message)
      }
    } catch (err) {
      console.warn('Gagal parse URL avatar lama:', err)
    }
  },
}