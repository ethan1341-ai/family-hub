import type { Metadata } from 'next'
import '@/styles/globals.css'
import Header from '@/components/shared/Header'

export const metadata: Metadata = {
  title: '家族成員圖',
  description: '家族成員資料、聚餐通知與管理平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
