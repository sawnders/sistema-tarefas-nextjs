import { useEffect, useState } from 'react'

const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_FAMILY_PASSWORD || 'familia123'
const STORAGE_KEY = 'sistema-tarefas--lista'
const STORAGE_HOURS_KEY = 'sistema-tarefas--horarios'

export default function Home() {
  const [passwordInput, setPasswordInput] = useState('')
  const [authed, setAuthed] = useState(false)

  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [startHour, setStartHour] = useState(10) // padrão 10h
  const [endHour, setEndHour] = useState(23) // padrão 23h

  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY)
    if (savedTasks) setTasks(JSON.parse(savedTasks))

    const savedHours = localStorage.getItem(STORAGE_HOURS_KEY)
    if (savedHours) {
      const { start, end } = JSON.parse(savedHours)
      setStartHour(start)
      setEndHour(end)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem(STORAGE_HOURS_KEY, JSON.stringify({ start: startHour, end: endHour }))
  }, [startHour, endHour])

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
    const t = {
      id: Date.now(),
      text: newTask.trim(),
      status: 'pending', // pending, done, not_done
      explanation: '',
      details: ''
    }
    setTasks([t, ...tasks])
    setNewTask('')
  }

  function setStatus(id, status) {
    // se for 'not_done' pedir explicação
    if (status === 'not_done') {
      const explic = prompt('Por favor, explique o motivo de não ter feito a tarefa:')
      if (explic === null) return // se cancelou, não altera
      setTasks(tasks.map(t => t.id === id ? { ...t, status, explanation: explic } : t))
    } else {
      // status 'done' ou 'pending' só altera status e limpa explicação
      setTasks(tasks.map(t => t.id === id ? { ...t, status, explanation: status === 'pending' ? '' : t.explanation } : t))
    }
  }

  function editTask(id) {
    const t = tasks.find(x => x.id === id)
    if (!t) return
    const novoTexto = prompt('Editar tarefa:', t.text)
    if (novoTexto === null) return

    const novoDetalhes = prompt('Detalhes extras da tarefa (deixe em branco para manter atual):', t.details || '')
    setTasks(tasks.map(x => x.id === id ? { ...x, text: novoTexto, details: novoDetalhes || x.details } : x))
  }

  // Verifica o status visual da tarefa conforme horário e status
  function getTaskColor(task) {
    const now = new Date()
    const currentHour = now.getHours()

    if (task.status === 'done') return '#d4f8d4' // verde claro

    if (task.status === 'not_done') return '#f8d4d4' // vermelho claro

    // status pending: verificar se está perto do fim do dia ou passou do fim do dia
    if (task.status === 'pending') {
      if (currentHour >= endHour) return '#f8d4d4' // já passou do fim do dia, vermelho
      if (currentHour >= endHour - 2) return '#f8f3d4' // faltando 2h para acabar, amarelo claro
      return '#d4f8d4' // verde claro para pendente normal
    }

    return 'white' // default
  }

  return (
    <>
      {!authed ? (
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
      ) : (
        <main style={styles.container}>
          <div style={styles.card}>
            <h1>Lista de Tarefas — Família</h1>

            <div style={{ marginBottom: 12 }}>
              <label>
                Hora de início do dia: {' '}
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={startHour}
                  onChange={e => setStartHour(Number(e.target.value))}
                  style={{ width: 50, padding: 4, borderRadius: 4, border: '1px solid #ddd' }}
                />
              </label>{' '}
              <label>
                Hora de término do dia: {' '}
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={endHour}
                  onChange={e => setEndHour(Number(e.target.value))}
                  style={{ width: 50, padding: 4, borderRadius: 4, border: '1px solid #ddd' }}
                />
              </label>
            </div>

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
                <li
                  key={task.id}
                  style={{ 
                    ...styles.taskItem,
                    backgroundColor: getTaskColor(task)
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong>{task.text}</strong>
                      <button
                        onClick={() => editTask(task.id)}
                        style={styles.smallBtn}
                        title="Editar tarefa e detalhes"
                      >Editar</button>
                    </div>
                    {task.details && <small style={{ fontStyle: 'italic', color: '#555' }}>Detalhes: {task.details}</small>}
                    {task.status === 'not_done' && (
                      <small style={{ color: '#a00' }}>Não feito — motivo: {task.explanation}</small>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setStatus(task.id, 'done')}
                      disabled={task.status === 'done'}
                      style={{ ...styles.smallBtn, backgroundColor: '#b5f2b0' }}
                      title="Marcar como feito"
                    >
                      ✔ Feito
                    </button>
                    <button
                      onClick={() => setStatus(task.id, 'not_done')}
                      disabled={task.status === 'not_done'}
                      style={{ ...styles.smallBtn, backgroundColor: '#f2b5b5' }}
                      title="Marcar como não feito"
                    >
                      ✘ Não feito
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </main>
      )}
    </>
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
    color: '#fff',
    cursor: 'pointer'
  },
  smallBtn: {
    padding: '6px 8px',
    fontSize: 13,
    borderRadius: 6,
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer'
  },
  taskItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid #f0f0f0',
    borderRadius: 6,
    marginBottom: 8
  }
}
