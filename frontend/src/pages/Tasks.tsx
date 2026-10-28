import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context';
import { listTasks, createTask, updateTask, deleteTask } from '../api';
import type { Task, TaskCreate, TaskPriority, TaskStatus } from '../api';
import { format, parseISO, isPast, isToday } from 'date-fns';

function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task?: Task;
  onClose: () => void;
  onSave: (data: TaskCreate, id?: number) => void;
}) {
  const [form, setForm] = useState<TaskCreate>({
    title: task?.title || '',
    description: task?.description || '',
    subject: task?.subject || '',
    due_date: task?.due_date || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
  });

  function update<K extends keyof TaskCreate>(key: K, value: TaskCreate[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form, task?.id);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '520px', backgroundColor: 'var(--bg-surface)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="card-header">
          <h2 className="card-title">{task ? 'Edit Coursework Task' : 'Record New Coursework / Task'}</h2>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="task-title"
              className="form-input"
              type="text"
              placeholder="e.g. Operating Systems Lab 4 Submission"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-subject">
              Course / Subject
            </label>
            <input
              id="task-subject"
              className="form-input"
              type="text"
              placeholder="e.g. CS301 - Operating Systems"
              value={form.subject || ''}
              onChange={e => update('subject', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">
              Description / Instructions
            </label>
            <textarea
              id="task-desc"
              className="form-input"
              placeholder="Add key notes, submission portal links, or group members..."
              rows={3}
              value={form.description || ''}
              onChange={e => update('description', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-due">
                Due Date
              </label>
              <input
                id="task-due"
                className="form-input"
                type="date"
                value={form.due_date || ''}
                onChange={e => update('due_date', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                className="form-input"
                value={form.priority}
                onChange={e => update('priority', e.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                className="form-input"
                value={form.status}
                onChange={e => update('status', e.target.value as TaskStatus)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} id="cancel-task-btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="save-task-btn">
              {task ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { studentId } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const fetchTasks = useCallback(() => {
    if (!studentId) return;
    listTasks(studentId, {
      status: filterStatus || undefined,
      priority: filterPriority || undefined,
    })
      .then(setTasks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId, filterStatus, filterPriority]);

  useEffect(() => {
    if (!studentId) {
      navigate('/');
      return;
    }
    fetchTasks();
  }, [studentId, navigate, fetchTasks]);

  async function handleSave(data: TaskCreate, id?: number) {
    if (!studentId) return;
    if (id) {
      await updateTask(id, data);
    } else {
      await createTask(studentId, data);
    }
    setShowModal(false);
    setEditTask(undefined);
    fetchTasks();
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to remove this task?')) return;
    await deleteTask(id);
    fetchTasks();
  }

  async function toggleStatus(task: Task) {
    const next = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(task.id, { status: next });
    fetchTasks();
  }

  const filtered = tasks.filter(t => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !(t.subject || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const overdue = filtered.filter(
    t => t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)) && t.status !== 'completed'
  );
  const dueToday = filtered.filter(
    t => t.due_date && isToday(parseISO(t.due_date)) && t.status !== 'completed'
  );
  const upcoming = filtered.filter(
    t => (!t.due_date || (!isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)))) && t.status !== 'completed'
  );
  const completed = filtered.filter(t => t.status === 'completed');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks &amp; Coursework</h1>
          <p className="page-description">
            Track academic assignments, lab reports, exams, and project milestones.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditTask(undefined);
            setShowModal(true);
          }}
          id="new-task-btn"
        >
          + Add New Task
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            type="search"
            placeholder="Search tasks or course..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '220px', padding: '6px 10px' }}
            id="task-search"
          />

          <select
            className="form-input"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ width: '150px', padding: '6px 10px' }}
            id="filter-status"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="form-input"
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            style={{ width: '140px', padding: '6px 10px' }}
            id="filter-priority"
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {(searchQuery || filterStatus || filterPriority) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('');
                setFilterPriority('');
              }}
            >
              Reset Filters
            </button>
          )}

          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Showing {filtered.length} of {tasks.length} total tasks
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading course tasks...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            No tasks match the selected criteria
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            You have no pending assignments or coursework matching this filter.
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditTask(undefined);
              setShowModal(true);
            }}
          >
            + Create New Task
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {overdue.length > 0 && (
            <TaskTableSection
              title="Overdue Tasks"
              badgeClass="badge-red"
              tasks={overdue}
              onEdit={t => {
                setEditTask(t);
                setShowModal(true);
              }}
              onDelete={handleDelete}
              onToggle={toggleStatus}
            />
          )}

          {dueToday.length > 0 && (
            <TaskTableSection
              title="Due Today"
              badgeClass="badge-amber"
              tasks={dueToday}
              onEdit={t => {
                setEditTask(t);
                setShowModal(true);
              }}
              onDelete={handleDelete}
              onToggle={toggleStatus}
            />
          )}

          {upcoming.length > 0 && (
            <TaskTableSection
              title="Upcoming Coursework"
              badgeClass="badge-blue"
              tasks={upcoming}
              onEdit={t => {
                setEditTask(t);
                setShowModal(true);
              }}
              onDelete={handleDelete}
              onToggle={toggleStatus}
            />
          )}

          {completed.length > 0 && (
            <TaskTableSection
              title="Completed Coursework"
              badgeClass="badge-green"
              tasks={completed}
              onEdit={t => {
                setEditTask(t);
                setShowModal(true);
              }}
              onDelete={handleDelete}
              onToggle={toggleStatus}
            />
          )}
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editTask}
          onClose={() => {
            setShowModal(false);
            setEditTask(undefined);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TaskTableSection({
  title,
  badgeClass,
  tasks,
  onEdit,
  onDelete,
  onToggle,
}: {
  title: string;
  badgeClass: string;
  tasks: Task[];
  onEdit: (t: Task) => void;
  onDelete: (id: number) => void;
  onToggle: (t: Task) => void;
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
            {title}
          </span>
          <span className={`badge ${badgeClass}`}>{tasks.length}</span>
        </div>
      </div>

      <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Done</th>
              <th>Task Details</th>
              <th>Subject / Course</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => {
              const isDone = task.status === 'completed';
              return (
                <tr key={task.id} style={{ opacity: isDone ? 0.65 : 1 }}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => onToggle(task)}
                      id={`task-toggle-${task.id}`}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {task.subject || 'General'}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        task.priority === 'high'
                          ? 'badge-red'
                          : task.priority === 'medium'
                          ? 'badge-amber'
                          : 'badge-green'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-gray">
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {task.due_date ? format(parseISO(task.due_date), 'MMM d, yyyy') : 'No deadline'}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEdit(task)}
                      id={`edit-task-${task.id}`}
                      style={{ marginRight: '6px' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(task.id)}
                      id={`delete-task-${task.id}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
