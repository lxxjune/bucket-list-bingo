'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email')
    const password = formData.get('password')

    if (typeof email !== 'string' || typeof password !== 'string') {
        redirect(`/login?message=${encodeURIComponent('이메일과 비밀번호를 입력해주세요.')}`)
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error(error)
        redirect(`/login?message=${encodeURIComponent('이메일과 비밀번호를 입력해주세요.')}`)
    }

    revalidatePath('/bingo', 'layout')
    redirect('/bingo')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email')
    const password = formData.get('password')

    if (typeof email !== 'string' || typeof password !== 'string') {
        redirect(`/login?message=${encodeURIComponent('이메일과 비밀번호를 입력해주세요.')}`)
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        console.error(error)
        redirect(`/login?message=${encodeURIComponent('이메일과 비밀번호를 입력해주세요.')}`)
    }

    revalidatePath('/bingo', 'layout')
    redirect('/bingo')
}

export async function loginOrSignup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email')
    const password = formData.get('password')

    if (typeof email !== 'string' || typeof password !== 'string') {
        redirect(`/login?message=${encodeURIComponent('이메일과 비밀번호를 입력해주세요.')}`)
    }

    // 1. Try Login first
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    // If login successful, redirect
    if (!loginError) {
        revalidatePath('/bingo', 'layout')
        redirect('/bingo')
    }

    // Check specific Login errors
    if (loginError.message.includes('Email not confirmed')) {
        redirect(`/login?message=${encodeURIComponent('이메일을 확인해주세요.')}`)
    }

    // 2. If Login failed (and not unverified), try Signup
    // Only try signup if the error suggests user might not exist (i.e. Invalid credentials)
    // If it's a different error (e.g. rate limit), trying signup is wasteful but harmless strictly speaking.

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
    })

    // Check if signup required verification
    if (signupData.user && !signupData.session) {
        redirect(`/login?message=${encodeURIComponent('회원가입이 완료되었습니다!\n이메일을 확인하여 계정을 인증해주세요.')}`)
    }

    if (signupError) {
        console.error('Login Error:', loginError)
        console.error('Signup Error:', signupError)

        // If Signup failed because "User already registered", it means they exist but Login failed (Wrong Password)
        if (signupError.message.includes('User already registered') || signupError.status === 400) {
            redirect(`/login?message=${encodeURIComponent('잘못된 비밀번호 입니다. 다시 시도해주세요.')}`)
        }

        if (signupError.message.includes('rate limit') || signupError.status === 429) {
            redirect(`/login?message=${encodeURIComponent('너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.')}`)
        }

        // Show actual error for debugging
        redirect(`/login?message=${encodeURIComponent(signupError.message)}`)
    }

    // If signup successful (and auto-loggedin)
    revalidatePath('/bingo', 'layout')
    redirect('/bingo')
}
