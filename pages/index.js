import { useEffect, useState } from 'react'

const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_FAMILY_PASSWORD || 'familia123'
const STORAGE_KEY = 'sistema-tarefas--lista'

export default function Home() {
  const [passwordInput, setPasswordInput] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setTasks(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  function login(e) {
    e.preventDefault()
    if (passwordInput === DEFAULT_PASSWORD) {
      setAuthed(true)
      setPasswordInput('')
    } else {
      alert('Senha incorreta.')
    }
  }

  function addTask() {
    if (!newTask.trim()) return
    const t = { id: Date.now(), text: newTask.trim(), done: false }
    setTasks([t, ...tasks])
    setNewTask('')
  }

  function toggleDone(id) {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function removeTask(id) {
    if (!confirm('Eliminar a tarefa?')) return
    setTasks(tasks.filter(t => t.id !== id))
  }

  function editTask(id) {
    const t = tasks.find(x => x.id === id)
    const novo = prompt('Editar tarefa:', t.text)
    if (novo == null) return
    setTasks(tasks.map(x => x.id === id ? { ...x, text: novo } : x))
  }

  if (!authed) {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <h1>Entrar — Sistema de Tarefas (Família)</h1>
          <form onSubmit={login} style={{ marginTop: 10 }}>
            <input
              placeholder="Senha da família"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              style={styles.input}
              type="password"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={styles.button} type="submit">Entrar</button>
            </div>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1>Lista de Tarefas — Família</h1>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <input
            placeholder="Escreve uma nova tarefa..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTask())}
            style={{ ...styles.input, flex: 1 }}
          />
          <button onClick={addTask} style={styles.button}>Adicionar</button>
        </div>

        <ul style={{ marginTop: 16, padding: 0, listStyle: 'none' }}>
          {tasks.length === 0 && <li style={{ color: '#666' }}>Nenhuma tarefa ainda.</li>}
          {tasks.map(task => (
            <li key={task.id} style={styles.taskItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={task.done} onChange={() => toggleDone(task.id)} />
                <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => editTask(task.id)} style={styles.smallBtn}>Editar</button>
                <button onClick={() => removeTask(task.id)} style={styles.smallBtn}>Apagar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f2f4f8',
    padding: 20
  },
  card: {
    width: '100%',
    maxWidth: 720,
    background: '#fff',
    padding: 20,
    borderRadius: 8,
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
  },
  input: {
    padding: '8px 12px',
    fontSize: 16,
    borderRadius: 6,
    border: '1px solid #ddd'
  },
  button: {
    padding: '8px 12px',
    fontSize: 16,
    borderRadius: 6,
    border: 'none',
    background: '#2563eb',
    color: '#fff'
  },
  smallBtn: {
    padding: '6px 8px',
    fontSize: 13,
    borderRadius: 6,
    border: '1px solid #ddd',
    background: '#fff'
  },
  taskItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0'
  }
}