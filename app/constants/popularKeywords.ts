import { getSupportedEmotions } from './emotionMappings';

// 使用支持映射的关键词
export const POPULAR_KEYWORDS = getSupportedEmotions();

// 随机获取指定数量的关键词
export function getRandomKeywords(count: number): string[] {
    const shuffled = [...POPULAR_KEYWORDS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
} 