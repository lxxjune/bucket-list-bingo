'use client';

import { loginOrSignup } from './actions';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { ActionButton } from '@/components/ActionButton';
import { useLogEvent } from '@/hooks/useLogEvent';
import { useGlobalLoading } from '@/context/GlobalLoadingContext';
import { useEffect } from 'react';

function LoginFormContent() {
    const { logEvent } = useLogEvent();
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get('message');
    const { setIsLoading } = useGlobalLoading();

    // Turn off loading when error message appears (meaning server action returned)
    useEffect(() => {
        setIsLoading(false);
    }, [errorMessage, setIsLoading]);

    return (
        <div className="min-h-screen flex flex-col items-center pt-[120px] px-[20px] bg-white">
            <div className="w-full max-w-[400px] flex flex-col">
                {/* Title */}
                <div className="text-center">
                    <h1 className="text-[20px] font-bold text-black leading-tight">
                        로그인 / 회원가입
                    </h1>
                </div>

                {/* Form */}
                <form className="flex flex-col gap-2 mt-[40px]">
                    <div className="space-y-1">
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="이메일"
                            className="w-full h-[56px] px-4 bg-white border border-[#E5E5E5] rounded-[8px] text-[16px] outline-none focus:border-black transition-all placeholder-[#A3A3A3]"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="비밀번호"
                            className="w-full h-[56px] px-4 bg-white border border-[#E5E5E5] rounded-[8px] text-[16px] outline-none focus:border-black transition-all placeholder-[#A3A3A3]"
                        />
                    </div>

                    {/* Message Area */}
                    {errorMessage && (
                        <div className={cn(
                            "text-sm text-center font-medium p-3 rounded-lg whitespace-pre-wrap",
                            (errorMessage.includes('완료되었습니다') || errorMessage.includes('성공적으로'))
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-500"
                        )}>
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex flex-col items-center mt-[24px]">
                        <ActionButton
                            type="submit"
                            formAction={loginOrSignup}
                            variant="fill"
                            size="md"
                            onClick={() => {
                                setIsLoading(true);
                                logEvent('CLICK_LOGIN_SUBMIT');
                            }}
                        >
                            로그인 / 회원가입
                        </ActionButton>

                        <a
                            href="/login/reset"
                            className="text-[14px] text-[#737373] underline mt-[16px]"
                            onClick={() => logEvent('CLICK_RESET_PASSWORD_LINK')}
                        >
                            비밀번호를 잊으셨나요?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <LoginFormContent />
        </Suspense>
    );
}
