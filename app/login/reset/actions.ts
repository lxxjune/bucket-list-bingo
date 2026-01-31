'use server';

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function resetPassword(formData: FormData) {
    const supabase = await createClient();
    const origin = (await headers()).get('origin');
    const email = formData.get('email');

    if (typeof email !== 'string' || !email) {
        redirect(`/login/reset?message=${encodeURIComponent('이메일을 입력해주세요.')}`);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/login/update-password`,
    });

    if (error) {
        console.error('Reset Password Error:', error);
        if (error.message.includes('rate limit') || error.status === 429) {
            redirect(`/login/reset?message=${encodeURIComponent('너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.')}`);
        }
        redirect(`/login/reset?message=${encodeURIComponent(error.message)}`);
    }

    redirect(`/login/reset?message=${encodeURIComponent('재설정 링크를 이메일로 보냈습니다! 메일함을 확인해주세요.')}`);
}
