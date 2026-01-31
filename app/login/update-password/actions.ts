'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const password = formData.get('password');

    if (typeof password !== 'string' || !password) {
        redirect(`/login/update-password?message=${encodeURIComponent('비밀번호를 입력해주세요.')}`);
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('UpdatePassword Action - User:', user?.id);

    if (!user) {
        console.error('UpdatePassword Action - No User Found');
        redirect(`/login?message=${encodeURIComponent('세션이 만료되었습니다. 로그인을 다시 시도해주세요.')}`);
    }

    const { error } = await supabase.auth.updateUser({
        password: password,
    });

    if (error) {
        console.error('Update Password Error:', error);
        redirect(`/login/update-password?message=${encodeURIComponent(error.message)}`);
    }

    redirect(`/?message=${encodeURIComponent('비밀번호가 성공적으로 변경되었습니다!')}`);
}
