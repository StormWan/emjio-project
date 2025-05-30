import { EmojiMode } from '../types';

export const EMOJI_MODES: EmojiMode[] = [
    {
        id: 'single',
        name: '表情单品',
        description: '生成1张精美表情包',
        count: 1
    },
    {
        id: 'album',
        name: '表情专辑',
        description: '生成8-24张系列表情包',
        count: 'custom'
    }
]; 