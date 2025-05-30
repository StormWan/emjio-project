'use client';

import React, { useState, useEffect } from 'react';
import { getRandomSuggestions, getSuggestionsByCategory, SUBJECT_SUGGESTIONS } from '../constants/subjectSuggestions';
import { SubjectSuggestion } from '../types';
import styles from './InspirationModal.module.scss';

interface InspirationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectSuggestion: (suggestion: string) => void;
}

export default function InspirationModal({ isOpen, onClose, onSelectSuggestion }: InspirationModalProps) {
    const [suggestions, setSuggestions] = useState<SubjectSuggestion[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = ['all', ...Array.from(new Set(SUBJECT_SUGGESTIONS.map(s => s.category)))];

    useEffect(() => {
        if (isOpen) {
            refreshSuggestions();
        }
    }, [isOpen, selectedCategory]);

    const refreshSuggestions = () => {
        if (selectedCategory === 'all') {
            setSuggestions(getRandomSuggestions(12));
        } else {
            setSuggestions(getSuggestionsByCategory(selectedCategory));
        }
    };

    const handleSelectSuggestion = (suggestion: SubjectSuggestion) => {
        onSelectSuggestion(suggestion.example);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>创作灵感</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.categorySelector}>
                    <label>选择分类：</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">全部分类</option>
                        {categories.slice(1).map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <button
                        className={styles.refreshButton}
                        onClick={refreshSuggestions}
                    >
                        换一批
                    </button>
                </div>

                <div className={styles.suggestionsGrid}>
                    {suggestions.map((suggestion) => (
                        <div
                            key={suggestion.id}
                            className={styles.suggestionCard}
                            onClick={() => handleSelectSuggestion(suggestion)}
                        >
                            <div className={styles.suggestionCategory}>
                                {suggestion.category}
                            </div>
                            <div className={styles.suggestionTitle}>
                                {suggestion.description}
                            </div>
                            <div className={styles.suggestionExample}>
                                {suggestion.example}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 