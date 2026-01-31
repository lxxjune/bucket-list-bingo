'use client';

import { resetPassword } from './actions';
import { useSearchParams } from 'next/navigation';
import { ActionButton } from '@/components/ActionButton';
import { useLogEvent } from '@/hooks/useLogEvent';

export default function ResetPasswordPage() {
    const { logEvent } = useLogEvent();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');
    const isSuccess = message?.includes('sent') || message?.includes('보냈습니다') || message?.includes('완료되었습니다');

    return (
        <div className="min-h-screen flex flex-col items-center pt-[120px] px-[20px] bg-white">
            <div className="w-full max-w-[400px] flex flex-col">

                {/* Title */}
                <div className="text-center mb-[40px]">
                    <h1 className="text-[20px] font-bold text-black leading-tight">
                        비밀번호 재설정
                    </h1>
                    <p className="text-[#737373] mt-4 mb-4 text-[14px]">
                        가입한 이메일을 입력하시면<br />재설정 링크를 보내드립니다.
                    </p>
                </div>

                {/* Form */}
                <form className="flex flex-col gap-2">
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

                    {/* Message Area */}
                    {message && (
                        <div className={`text-sm text-center font-medium p-3 rounded-lg ${isSuccess
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-500'
                            }`}>
                            {message}
                        </div>
                    )}

                    <div className="flex flex-col items-center mt-[24px]">
                        <ActionButton
                            type="submit"
                            formAction={resetPassword}
                            variant="fill"
                            size="md"
                            onClick={() => logEvent('CLICK_RESET_PASSWORD_SUBMIT', {
                                displayed_message: message || ''
                            })}
                        >
                            재설정 링크 보내기
                        </ActionButton>

                        <a href="/login" className="text-[14px] text-[#737373] underline mt-[16px]">
                            로그인으로 돌아가기
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
