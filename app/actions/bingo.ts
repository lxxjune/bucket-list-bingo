'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type BingoData = {
    title: string;
    grid_data: any; // Using any for JSONB flexibility, strictly could be typed
    drawing_data?: any; // Stores drawing paths
    period_type: 'Yearly' | 'Monthly';
    period_value: string;
    grid_size: string;
}

export async function saveBoard(data: BingoData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Calculate analytics metrics
    // grid_data is a string[] (e.g. ["goal1", "", "goal3"])
    const finalFilledCount = Array.isArray(data.grid_data)
        ? data.grid_data.filter((cell: any) => typeof cell === 'string' && cell.trim().length > 0).length
        : 0;

    const isDecorated = Array.isArray(data.drawing_data) && data.drawing_data.length > 0;

    const { error } = await supabase
        .from('bingo_boards')
        .upsert({
            user_id: user.id,
            title: data.title,
            grid_data: data.grid_data,
            drawing_data: data.drawing_data,
            period_type: data.period_type,
            period_value: data.period_value,
            grid_size: data.grid_size,

            // Analytics columns
            final_filled_count: finalFilledCount,
            is_decorated: isDecorated,

            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id, period_type, period_value, grid_size'
        })

    if (error) {
        console.error('Error saving board:', error)
        return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function fetchBoard(periodType: 'Yearly' | 'Monthly', periodValue: string, gridSize: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized', data: null }
    }

    const { data, error } = await supabase
        .from('bingo_boards')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_type', periodType)
        .eq('period_value', periodValue)
        .eq('grid_size', gridSize)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.error('Error fetching board:', error)
        return { error: error.message, data: null }
    }

    return { success: true, data: data || null }
}
