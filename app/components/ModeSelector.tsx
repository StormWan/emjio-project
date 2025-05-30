'use client';

import React from 'react';
import { EMOJI_MODES } from '../constants/emojiModes';
import { EmojiMode } from '../types';
import styles from './ModeSelector.module.scss';

interface ModeSelectorProps {
    selectedMode: string;
    onModeChange: (modeId: string) => void;
    albumCount: number;
    onAlbumCountChange: (count: number) => void;
}

export default function ModeSelector({
    selectedMode,
    onModeChange,
    albumCount,
    onAlbumCountChange
}: ModeSelectorProps) {
    return (
        <div className={styles.modeSelector}>
            <label className={styles.label}>表情包模式</label>
            <div className={styles.modesContainer}>
                {EMOJI_MODES.map((mode) => (
                    <div
                        key={mode.id}
                        className={`${styles.modeCard} ${selectedMode === mode.id ? styles.selected : ''}`}
                        onClick={() => onModeChange(mode.id)}
                    >
                        <div className={styles.radioButton}>
                            <input
                                type="radio"
                                name="emojiMode"
                                value={mode.id}
                                checked={selectedMode === mode.id}
                                onChange={() => onModeChange(mode.id)}
                            />
                        </div>
                        <div className={styles.modeInfo}>
                            <h3>{mode.name}</h3>
                            <p>{mode.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 专辑模式下显示数量选择 */}
            {selectedMode === 'album' && (
                <div className={styles.albumCountSelector}>
                    <label>选择生成数量</label>
                    <div className={styles.countOptions}>
                        {[2, 8, 12, 16, 20, 24].map(count => (
                            <button
                                key={count}
                                type="button"
                                className={`${styles.countButton} ${albumCount === count ? styles.active : ''}`}
                                onClick={() => onAlbumCountChange(count)}
                            >
                                {count}张
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 