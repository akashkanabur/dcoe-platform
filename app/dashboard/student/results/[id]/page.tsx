import { redirect } from 'next/navigation'

// Redirect /dashboard/student/results/[id] → /exam/result/[id]
export default function StudentResultDetail({ params }: { params: { id: string } }) {
  redirect(`/exam/result/${params.id}`)
}
