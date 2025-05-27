import React from 'react';
import './globals.scss'

export const metadata = {
    title: 'AI表情包生成器',
    description: '使用AI技术生成个性化表情包',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN">
            <body>{children}</body>
        </html>
    )
} 