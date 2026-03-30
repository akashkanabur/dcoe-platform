import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-client'

export async function DELETE(req: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const supabase = getSupabaseAdmin()
      
      // Clear all logs from admin_logs table
      // In Supabase/PostgREST, to delete all, we usually need a filter that matches all, 
      // or just delete() without filters if allowed (but often it requires at least one filter for safety).
      // We'll use a filter that is always true for all UUIDs.
      const { error } = await supabase
        .from('admin_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Log this action itself? Maybe, but if we just cleared everything, 
      // it might be ironic. However, it's good for the audit trail.
      await supabase.from('admin_logs').insert({
        admin_email: user.email,
        action: 'Cleared Audit Logs',
        details: { timestamp: new Date().toISOString() }
      })

      return NextResponse.json({ message: 'Audit logs cleared successfully' })
    } catch (err: any) {
      console.error('[Clear Audit] Error:', err)
      return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
    }
  }, 'admin')(req)
}
