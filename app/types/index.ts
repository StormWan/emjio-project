// 新增类型定义
export interface EmojiStyle {
    id: string;
    name: string;
    description: string;
    prompt: string;
    thumbnail?: string; // 您后续提供的素材路径
}

export interface GeneratedEmoji {
    id: number;
    keyword: string;
    imageData: string;
    processedImage?: string;
}

export interface BannerConfig {
    width: 750;
    height: 400;
    maxSize: 500; // KB
}

// 新增表情包模式
export interface EmojiMode {
    id: string;
    name: string;
    description: string;
    count: number | 'custom'; // custom表示可自定义数量
}

// 主体描述建议
export interface SubjectSuggestion {
    id: string;
    category: string;
    description: string;
    example: string;
} 