// ── Lógica compartilhada do Quiz da Copa ────────────────────────────

export const QUIZ_DURATION_DAYS = 7
export const RESULT_VISIBLE_DAYS = 4 // dias mostrando o vencedor no banner após o fim

export const QUESTION_PREVIEW_SECONDS = 5
export const QUESTION_ANSWER_SECONDS = 12

// Retorna o "estado" do quiz com base na start_date vinda do banco
// status: 'not_started' | 'active' | 'result' | 'archived'
export function getQuizStatus(startDate) {
  if (!startDate) return { status: 'not_started' }

  const start = new Date(startDate)
  const now = new Date()
  const msPerDay = 86400000

  const activeEnd = new Date(start.getTime() + QUIZ_DURATION_DAYS * msPerDay)
  const resultEnd = new Date(activeEnd.getTime() + RESULT_VISIBLE_DAYS * msPerDay)

  if (now < activeEnd) {
    const daysLeft = Math.ceil((activeEnd - now) / msPerDay)
    return { status: 'active', activeEnd, daysLeft }
  }
  if (now < resultEnd) {
    return { status: 'result', resultEnd }
  }
  return { status: 'archived' }
}
