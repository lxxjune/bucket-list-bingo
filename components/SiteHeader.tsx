'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { signOut } from '@/app/auth/actions';
import { useLogEvent } from '@/hooks/useLogEvent';

interface SiteHeaderProps {
    isLoggedIn: boolean;
    email?: string;
}

export default function SiteHeader({ isLoggedIn, email }: SiteHeaderProps) {
    const { logEvent } = useLogEvent();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center p-4 bg-white text-black pointer-events-none">
                <div className="pointer-events-auto">
                    <Link
                        href="/"
                        className="font-extrabold text-[14px] tracking-tight hover:opacity-80 transition-opacity"
                        onClick={() => logEvent('CLICK_HEADER_HOME')}
                    >
                        BUCKET LIST
                    </Link>
                </div>

                <div className="pointer-events-auto">
                    {isLoggedIn ? (
                        <button
                            onClick={() => {
                                setIsMenuOpen(true);
                                logEvent('CLICK_MENU_OPEN');
                            }}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                            <Menu size={24} />
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            onClick={() => logEvent('CLICK_HEADER_LOGIN')}
                            className="text-[14px] font-semibold hover:opacity-80 transition-opacity"
                        >
                            로그인 / 회원가입
                        </Link>
                    )}
                </div>
            </header>

            {/* Sidebar Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Sidebar */}
                    <div className="relative w-[300px] h-full bg-white p-4 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-12">
                            <span className=""></span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Close menu"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col mt-4 gap-6 items-center">
                            <Link
                                href="/"
                                className="text-2xl font-black hover:text-gray-600 transition-colors"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    logEvent('CLICK_HEADER_HOME');
                                }}
                            >
                                HOME
                            </Link>
                            <Link
                                href="/bingo"
                                className="text-2xl font-black hover:text-gray-600 transition-colors"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    logEvent('CLICK_HEADER_MY_BINGO');
                                }}
                            >
                                MY BINGO
                            </Link>

                        </div>

                        <div className="mt-auto w-full flex justify-center">
                            <form action={signOut}>
                                <button
                                    type="submit"
                                    onClick={() => logEvent('CLICK_LOGOUT')}
                                    className="text-sm mb-12 font-semibold text-gray-600 underline hover:text-gray-800 transition-colors"
                                >
                                    로그아웃
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
