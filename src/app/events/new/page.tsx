'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewEventPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [userMemberId, setUserMemberId] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    address: '',
    notes: '',
    status: 'draft' as 'draft' | 'published',
  })

  useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    try {
      const email = localStorage.getItem('user_email')
      if (!email) {
        setIsAuthorized(false)
        return
      }

      const { data: user } = await supabase
        .from('users')
        .select('id, is_admin')
        .eq('email', email)
        .single()

      if (!user) {
        setIsAuthorized(false)
        return
      }

      setIsAdmin(user.is_admin)

      // 取得該使用者對應的家族成員 ID
      const { data: member } = await supabase
        .from('family_members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (member) {
        setUserMemberId(member.id)
      }

      setIsAuthorized(user.is_admin)
    } catch (err) {
      console.error('Permission check error:', err)
      setIsAuthorized(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const email = localStorage.getItem('user_email')
      if (!email) {
        throw new Error('未登入')
      }

      // 取得該使用者的 ID
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (!user) {
        throw new Error('無法找到使用者')
      }

      // 建立活動
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          name: formData.name,
          date: formData.date,
          time: formData.time || null,
          location: formData.location,
          address: formData.address || null,
          notes: formData.notes || null,
          created_by: user.id,
          created_by_member_id: userMemberId,
          status: formData.status,
        })
        .select()
        .single()

      if (eventError) {
        throw new Error(eventError.message)
      }

      // 通知所有成員
      if (event) {
        const { data: allMembers } = await supabase
          .from('family_members')
          .select('id')

        if (allMembers && allMembers.length > 0) {
          const notifications = allMembers.map(member => ({
            event_id: event.id,
            member_id: member.id,
            is_read: false,
          }))

          await supabase
            .from('notifications')
            .insert(notifications)
        }
      }

      router.push(`/events/${event.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '建立失敗')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthorized) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">只有管理員可以建立活動</p>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← 返回
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← 返回
          </button>
          <h1 className="text-3xl font-bold text-gray-900">建立新活動</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 活動名稱 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活動名稱 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="例：康家中秋聚餐"
              />
            </div>

            {/* 日期和時間 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期 *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  時間
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* 地點 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                地點 *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="例：文華東方酒店"
              />
            </div>

            {/* 詳細地址 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                詳細地址
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="街道、房號等詳細資訊"
              />
            </div>

            {/* 備註 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備註
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="活動相關備註"
              />
            </div>

            {/* 狀態 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                狀態
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="draft">草稿</option>
                <option value="published">發布</option>
              </select>
            </div>

            {/* 提交按鈕 */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {isSaving ? '建立中...' : '建立活動'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
