'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import ModeSelector from './ModeSelector';
import StyleSelector from './StyleSelector';
import InspirationModal from './InspirationModal';
import { getRandomKeywords } from '../constants/popularKeywords';
import styles from './InputSection.module.scss';
import React from 'react';

interface InputSectionProps {
    subjectDescription: string;
    setSubjectDescription: Dispatch<SetStateAction<string>>;
    keywords: string[];
    setKeywords: Dispatch<SetStateAction<string[]>>;
    selectedStyle: string;
    setSelectedStyle: Dispatch<SetStateAction<string>>;
    selectedMode: string;
    setSelectedMode: Dispatch<SetStateAction<string>>;
    albumCount: number;
    setAlbumCount: Dispatch<SetStateAction<number>>;
    onGenerate: () => void;
    isLoading: boolean;
    error: string;
}

export default function InputSection({
    subjectDescription,
    setSubjectDescription,
    keywords,
    setKeywords,
    selectedStyle,
    setSelectedStyle,
    selectedMode,
    setSelectedMode,
    albumCount,
    setAlbumCount,
    onGenerate,
    isLoading,
    error
}: InputSectionProps) {

    const [isInspirationModalOpen, setIsInspirationModalOpen] = useState(false);

    const handleKeywordChange = (index: number, value: string) => {
        const newKeywords = [...keywords];
        newKeywords[index] = value;
        setKeywords(newKeywords);
    };

    const fillRandomKeywords = () => {
        const count = selectedMode === 'single' ? 1 : albumCount;
        const randomKeywords = getRandomKeywords(count);
        setKeywords(randomKeywords);
    };

    const handleInspirationSelect = (suggestion: string) => {
        setSubjectDescription(suggestion);
    };

    const currentKeywordCount = selectedMode === 'single' ? 1 : albumCount;

    return (
        <div className={styles.inputSection}>
            {/* 模式选择器 */}
            <ModeSelector
                selectedMode={selectedMode}
                onModeChange={setSelectedMode}
                albumCount={albumCount}
                onAlbumCountChange={setAlbumCount}
            />

            {/* 主体描述输入 */}
            <div className={styles.subjectInput}>
                <div className={styles.subjectHeader}>
                    <label htmlFor="subject">表情包主体描述</label>
                    <button
                        type="button"
                        onClick={() => setIsInspirationModalOpen(true)}
                        className={styles.inspirationButton}
                    >
                        💡 需要灵感？
                    </button>
                </div>
                <textarea
                    id="subject"
                    value={subjectDescription}
                    onChange={(e) => setSubjectDescription(e.target.value)}
                    placeholder="例如：一只胖嘟嘟的橘色小猫咪，戴着蓝色蝴蝶结"
                    maxLength={100}
                    rows={3}
                />
                <div className={styles.guidance}>
                    <p>请尽可能具体地描述表情包的主角及其主要特征，例如'一只戴眼镜的黄色柴犬'，这将影响 AI 生成的基础形象。</p>
                </div>
            </div>

            {/* 风格选择器 */}
            <StyleSelector
                selectedStyle={selectedStyle}
                onStyleChange={setSelectedStyle}
            />

            {/* 关键词输入 */}
            <div className={styles.keywordsInput}>
                <div className={styles.keywordsHeader}>
                    <label>
                        {selectedMode === 'single' ? '1个关键词描述' : `${currentKeywordCount}个关键词描述`}
                    </label>
                    <button
                        type="button"
                        onClick={fillRandomKeywords}
                        className={styles.fillButton}
                    >
                        随机填充关键词
                    </button>
                </div>

                <div className={styles.keywordsGrid}>
                    {keywords.map((keyword, index) => (
                        <div key={index} className={styles.keywordItem}>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => handleKeywordChange(index, e.target.value)}
                                placeholder={`关键词 ${index + 1}`}
                                maxLength={4}
                            />
                        </div>
                    ))}
                </div>

                <div className={styles.guidance}>
                    <p>请填写与表情包情感或动作相关的词语，例如'开心'、'思考'、'震惊'。每个词语不超过4个字，确保每个词语都能清晰表达一种情绪或动作。</p>
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
                onClick={onGenerate}
                disabled={isLoading}
                className={styles.generateButton}
            >
                {isLoading ? '生成中...' : '生成表情包'}
            </button>

            {/* 灵感建议弹窗 */}
            <InspirationModal
                isOpen={isInspirationModalOpen}
                onClose={() => setIsInspirationModalOpen(false)}
                onSelectSuggestion={handleInspirationSelect}
            />
        </div>
    );
} 