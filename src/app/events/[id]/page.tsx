'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getRepresentableMembers } from '@/lib/relations'
import type { Event, FamilyMember } from '@/types'

interface EventDetail extends Event {
  createdByMemberName?: string
}

interface RSVP {
  id: string
  memberId: string
  memberName: string
  status: string
  respondedAt?: string
}

export default function EventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [rsvpList, setRsvpList] = useState<RSVP[]>([])
  const [representableMembers, setRepresentableMembers] = useState<
    FamilyMember[]
  >([])
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isCreator, setIsCreator] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    checkAuth()
    fetchEvent()
    fetchRSVPs()
  }, [eventId])

  const checkAuth = async () => {
    const email = localStorage.getItem('user_email')
    if (email) {
      setUserEmail(email)
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (user) {
        setUserId(user.id)
        const members = await getRepresentableMembers(user.id)
        setRepresentableMembers(members)
        if (members.length > 0) {
          setSelectedMemberId(members[0].id)
        }
      }
    }
  }

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(
          `
          *,
          created_by_member:created_by_member_id (name, nickname)
        `
        )
        .eq('id', eventId)
        .single()

      if (error || !data) {
        throw new Error('無法取得活動資訊')
      }

      // 檢查是否是活動建立者
      const email = localStorage.getItem('user_email')
      if (email) {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single()

        if (user && user.id === data.created_by) {
          setIsCreator(true)
        }
      }

      setEvent({
        ...data,
        createdByMemberName:
          data.created_by_member?.nickname ||
          data.created_by_member?.name ||
          '管理員',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '取得資訊失敗')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRSVPs = async () => {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('id, member_id, status, responded_at')
        .eq('event_id', eventId)

      if (error) {
        console.error('Fetch RSVPs error:', error)
        return
      }

      // 補充成員名稱
      const rsvpsWithNames = await Promise.all(
        (data || []).map(async rsvp => {
          const { data: member } = await supabase
            .from('family_members')
            .select('name, nickname')
            .eq('id', rsvp.member_id)
            .single()

          return {
            id: rsvp.id,
            memberId: rsvp.member_id,
            memberName: member?.nickname || member?.name || '未知',
            status: rsvp.status,
            respondedAt: rsvp.responded_at,
          }
        })
      )

      setRsvpList(rsvpsWithNames)
    } catch (err) {
      console.error('Error fetching RSVPs:', err)
    }
  }

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      if (!selectedMemberId) {
        throw new Error('請選擇代表成員')
      }

      // 檢查是否已存在 RSVP
      const { data: existingRsvp } = await supabase
        .from('rsvps')
        .select('id')
        .eq('event_id', eventId)
        .eq('member_id', selectedMemberId)
        .single()

      if (existingRsvp) {
        // 更新現有 RSVP
        const { error } = await supabase
          .from('rsvps')
          .update({
            status: selectedStatus,
            responded_at: new Date().toISOString(),
          })
          .eq('id', existingRsvp.id)

        if (error) throw error
      } else {
        // 新增 RSVP
        const { error } = await supabase
          .from('rsvps')
          .insert({
            event_id: eventId,
            member_id: selectedMemberId,
            status: selectedStatus,
            responded_at: new Date().toISOString(),
          })

        if (error) throw error
      }

      await fetchRSVPs()
      setSelectedStatus('pending')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'RSVP 失敗')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!confirm('確定要刪除這個活動嗎？此操作無法復原。')) {
      return
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error
      router.push('/events')
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除失敗')
    }
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <p className="text-center text-gray-600">載入中...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-4">無法找到活動</p>
          <button
            onClick={() => router.push('/events')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            返回活動列表
          </button>
        </div>
      </div>
    )
  }

  // 統計
  const attendingCount = rsvpList.filter(r => r.status === 'attending').length
  const notAttendingCount = rsvpList.filter(
    r => r.status === 'not-attending'
  ).length
  const pendingCount = rsvpList.filter(r => r.status === 'pending').length

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/events')}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← 返回活動列表
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              <p className="text-gray-600 mt-2">
                發起人：{event.createdByMemberName}
              </p>
            </div>
            {isCreator && (
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/events/${eventId}/edit`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  編輯
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  刪除
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* 活動資訊 */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-600">日期</p>
              <p className="text-lg font-semibold text-gray-900">
                📅{' '}
                {new Date(event.date).toLocaleDateString('zh-TW', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
                {event.time && ` · 🕐 ${event.time}`}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">地點</p>
              <p className="text-lg font-semibold text-gray-900">
                📍 {event.location}
              </p>
            </div>

            {event.address && (
              <div>
                <p className="text-sm text-gray-600">詳細地址</p>
                <p className="text-gray-900">{event.address}</p>
              </div>
            )}

            {event.notes && (
              <div>
                <p className="text-sm text-gray-600">備註</p>
                <p className="text-gray-900">{event.notes}</p>
              </div>
            )}
          </div>

          {/* 統計卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              出席統計
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-green-600">出席</p>
                <p className="text-3xl font-bold text-green-600">
                  {attendingCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">待回覆</p>
                <p className="text-3xl font-bold text-gray-600">{pendingCount}</p>
              </div>
              <div>
                <p className="text-sm text-red-600">不出席</p>
                <p className="text-3xl font-bold text-red-600">
                  {notAttendingCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RSVP 區塊 */}
        {representableMembers.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 我要 RSVP
            </h3>
            <form onSubmit={handleRSVP} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    代表人
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={e => setSelectedMemberId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {representableMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.nickname || member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    回覆
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="pending">待回覆</option>
                    <option value="attending">出席</option>
                    <option value="not-attending">不出席</option>
                  </select>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 mt-6"
                  >
                    {isSaving ? '提交中...' : '提交回覆'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* RSVP 列表 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            回覆名單
          </h3>
          {rsvpList.length === 0 ? (
            <p className="text-gray-600">還沒有人回覆</p>
          ) : (
            <div className="space-y-2">
              {rsvpList.map(rsvp => (
                <div
                  key={rsvp.id}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    rsvp.status === 'attending'
                      ? 'bg-green-50'
                      : rsvp.status === 'not-attending'
                        ? 'bg-red-50'
                        : 'bg-gray-50'
                  }`}
                >
                  <span className="font-medium text-gray-900">
                    {rsvp.memberName}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      rsvp.status === 'attending'
                        ? 'text-green-600'
                        : rsvp.status === 'not-attending'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {rsvp.status === 'attending'
                      ? '✓ 出席'
                      : rsvp.status === 'not-attending'
                        ? '✗ 不出席'
                        : '待回覆'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
