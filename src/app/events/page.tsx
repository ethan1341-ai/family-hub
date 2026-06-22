'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types'
import Link from 'next/link'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        console.error('Fetch error:', error)
        return
      }

      setEvents(data || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 聚餐活動</h1>
          <p className="text-gray-600">共 {events.length} 個活動</p>
        </div>
        <Link
          href="/events/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-medium"
        >
          + 新增活動
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">載入中...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">還沒有建立任何活動</p>
          <Link
            href="/events/new"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            建立第一個活動
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 block"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {event.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    📅 {new Date(event.date).toLocaleDateString('zh-TW')}
                    {event.time && ` · ${event.time}`}
                  </p>
                  <p className="text-gray-600 mt-1">📍 {event.location}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : event.status === 'finished'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {event.status === 'published' ? '進行中' : event.status === 'finished' ? '已結束' : '草稿'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
