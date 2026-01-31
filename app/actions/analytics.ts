'use server';

import { createClient } from '@/utils/supabase/server';

type IncrementColumn = 'visit_count' | 'download_count';

export async function incrementBingoCount(
    periodValue: string,
    gridSize: string,
    column: IncrementColumn
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // 비로그인 유저는 카운트 증가 불가 (RLS와 동일하게 정책 적용)

    // RPC 함수 호출
    const { error } = await supabase.rpc('increment_bingo_count', {
        p_user_id: user.id,
        p_period_value: periodValue,
        p_grid_size: gridSize,
        p_column_name: column
    });

    if (error) {
        console.error(`Failed to increment ${column}:`, error);
    }
}
