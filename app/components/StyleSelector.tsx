'use client';

import React from 'react';
import { EMOJI_STYLES } from '../constants/emojiStyles';
import { EmojiStyle } from '../types';
import styles from './StyleSelector.module.scss';

interface StyleSelectorProps {
    selectedStyle: string;
    onStyleChange: (styleId: string) => void;
}

export default function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
    return (
        <div className={styles.styleSelector}>
            <label className={styles.label}>选择表情包风格</label>
            <div className={styles.stylesGrid}>
                {EMOJI_STYLES.map((style) => (
                    <div
                        key={style.id}
                        className={`${styles.styleCard} ${selectedStyle === style.id ? styles.selected : ''}`}
                        onClick={() => onStyleChange(style.id)}
                    >
                        <div className={styles.thumbnail}>
                            {style.thumbnail ? (
                                <img src={style.thumbnail} alt={style.name} />
                            ) : (
                                <div className={styles.placeholder}>
                                    <span>示例图片</span>
                                </div>
                            )}
                        </div>
                        <div className={styles.styleInfo}>
                            <h3>{style.name}</h3>
                            <p>{style.description}</p>
                        </div>
                        <div className={styles.radioButton}>
                            <input
                                type="radio"
                                name="emojiStyle"
                                value={style.id}
                                checked={selectedStyle === style.id}
                                onChange={() => onStyleChange(style.id)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 