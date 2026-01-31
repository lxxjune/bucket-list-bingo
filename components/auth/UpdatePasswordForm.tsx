'use client';

import { updatePassword } from '@/app/login/update-password/actions'; // Adjust import if needed, assuming I'll keep action there or move it.
import { ActionButton } from '@/components/ActionButton';
import { useLogEvent } from '@/hooks/useLogEvent';

export function UpdatePasswordForm({ message }: { message?: string }) {
    const { logEvent } = useLogEvent();

    return (
        <form className="flex flex-col gap-2">
            <div className="space-y-1">
                <label htmlFor="password" className="sr-only">New Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="새 비밀번호"
                    className="w-full h-[56px] px-4 bg-white border border-[#E5E5E5] rounded-[8px] text-[16px] outline-none focus:border-black transition-all placeholder-[#A3A3A3]"
                />
            </div>

            {/* Error Message */}
            {message && (
                <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-lg">
                    {message}
                </div>
            )}

            <div className="flex flex-col items-center mt-[24px]">
                <ActionButton
                    type="submit"
                    formAction={updatePassword}
                    variant="fill"
                    size="md"
                    onClick={() => logEvent('CLICK_UPDATE_PASSWORD_SUBMIT', {
                        displayed_message: message || ''
                    })}
                >
                    비밀번호 변경하기
                </ActionButton>
            </div>
        </form>
    );
}
