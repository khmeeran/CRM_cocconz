import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h1>Supabase Connection Test</h1>
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
        {(!todos || todos.length === 0) && <li>No todos found or table 'todos' does not exist.</li>}
      </ul>
    </div>
  )
}
