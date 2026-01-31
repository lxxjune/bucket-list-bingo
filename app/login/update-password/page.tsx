import { createClient } from '@/utils/supabase/server';
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';
import { cookies } from 'next/headers';

export default async function UpdatePasswordPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const message = typeof searchParams.message === 'string' ? searchParams.message : undefined;

    // Check Session Server-Side
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen flex flex-col items-center pt-[120px] px-[20px] bg-white">
            <div className="w-full max-w-[400px] flex flex-col">

                {/* Title */}
                <div className="text-center mb-[40px]">
                    <h1 className="text-[20px] font-bold text-black leading-tight">
                        새 비밀번호 설정
                    </h1>
                    <p className="text-[#737373] mt-2 text-[14px]">
                        새로운 비밀번호를 입력해주세요.
                    </p>

                    {!user && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
                            <p className="font-bold mb-1">인증 세션이 없습니다.</p>
                            <p>이메일 링크가 만료되었거나 다른 브라우저에서 열렸을 수 있습니다. 다시 시도해주세요.</p>
                        </div>
                    )}
                    {user && (
                        <div className="mt-2 text-xs text-green-600 font-mono">
                            Logged in: {user.email}
                        </div>
                    )}
                </div>

                {/* Form */}
                <UpdatePasswordForm message={message} />
            </div>
        </div>
    );
}
