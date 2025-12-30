'use client';

import React from 'react';
import { event } from '@/lib/analytics';
import { Shuffle } from 'lucide-react';

const RECOMMENDATIONS = [
    '오운완', '독서', '해외여행', '저축하기', '다이어트',
    '새로운 취미', '자격증 따기', '외국어 공부', '봉사활동', '콘서트 가기',
    '전시회 관람', '맛집 탐방', '가족 여행', '금주 도전', '금연 도전',
    '미라클 모닝', '일기 쓰기', '블로그 시작', '유튜브 도전', '투자 공부',
    '책 10권 읽기', '바디프로필', '제주도 여행', '부모님 용돈', '물 많이 마시기'
];

interface RecommendationChipsProps {
    onSelect: (keyword: string) => void;
    onRandomFill: (keywords: string[]) => void;
}

export const RecommendationChips = ({ onSelect, onRandomFill }: RecommendationChipsProps) => {
    const handleChipClick = (keyword: string) => {
        onSelect(keyword);
        event({
            action: 'recommendation_click',
            category: 'interaction',
            label: keyword,
        });
    };

    const handleRandomFill = () => {
        // Shuffle and pick 25 items (or fewer if not enough, but we have 25)
        const shuffled = [...RECOMMENDATIONS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 25);
        onRandomFill(selected);
        event({
            action: 'recommendation_click',
            category: 'interaction',
            label: 'random_fill_all',
        });
    };

    return (
        <div className="w-full max-w-md mx-auto mb-6">
            <div className="flex justify-between items-center mb-3 px-2">
                <h3 className="text-sm font-semibold text-gray-600">추천 키워드</h3>
                <button
                    onClick={handleRandomFill}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-2 py-1 rounded-full"
                >
                    <Shuffle size={12} />
                    랜덤 채우기
                </button>
            </div>
            <div className="flex flex-wrap gap-2 px-1">
                {RECOMMENDATIONS.slice(0, 10).map((keyword) => (
                    <button
                        key={keyword}
                        onClick={() => handleChipClick(keyword)}
                        className="px-3 py-1.5 text-sm bg-white text-gray-700 rounded-full shadow-sm border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95"
                    >
                        {keyword}
                    </button>
                ))}
                <span className="text-xs text-gray-400 self-center ml-1">...</span>
            </div>
        </div>
    );
};
