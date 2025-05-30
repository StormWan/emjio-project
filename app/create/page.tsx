'use client';

import React from 'react';
import EmojiGenerator from '../components/EmojiGenerator';
import styles from '../page.module.scss';

export default function CreatePage() {
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>AI 表情包生成器</h1>
                    <p>输入描述和关键词，生成专属表情包</p>
                </header>
                <EmojiGenerator />
            </div>
        </main>
    );
} 