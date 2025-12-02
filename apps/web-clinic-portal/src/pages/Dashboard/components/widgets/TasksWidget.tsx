/**
 * TasksWidget
 *
 * Shows pending tasks and reminders (mock data for now).
 */

import { WidgetWrapper } from './WidgetWrapper';
import { Badge } from '../../../../components/ui-new';

interface TasksWidgetProps {
  editMode?: boolean;
}

// Mock tasks data
const MOCK_TASKS = [
  {
    id: '1',
    title: 'Confirmare programare - Maria Popescu',
    priority: 'high',
    dueDate: new Date(),
    completed: false,
  },
  {
    id: '2',
    title: 'Recall pentru detartraj - Ion Georgescu',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000),
    completed: false,
  },
  {
    id: '3',
    title: 'Verificare rezultate laborator',
    priority: 'high',
    dueDate: new Date(),
    completed: false,
  },
  {
    id: '4',
    title: 'Comandare materiale consumabile',
    priority: 'low',
    dueDate: new Date(Date.now() + 172800000),
    completed: false,
  },
  {
    id: '5',
    title: 'Evaluare plan tratament - Elena Dumitrescu',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000),
    completed: false,
  },
];

const PRIORITY_CONFIG = {
  high: { label: 'Urgent', color: 'danger', icon: 'ti ti-alert-circle' },
  medium: { label: 'Mediu', color: 'warning', icon: 'ti ti-clock' },
  low: { label: 'Scazut', color: 'info', icon: 'ti ti-info-circle' },
};

export function TasksWidget({ editMode = false }: TasksWidgetProps) {
  const tasks = MOCK_TASKS.filter((task) => !task.completed);
  const isEmpty = tasks.length === 0;

  return (
    <WidgetWrapper
      id="tasks"
      title="Sarcini & Reminder-uri"
      icon="ti ti-checkbox"
      isEmpty={isEmpty}
      emptyMessage="Nu exista sarcini pendente"
      editMode={editMode}
      actions={
        <span className="badge bg-primary-transparent text-primary">
          {tasks.length} pendente
        </span>
      }
    >
      <div className="list-group list-group-flush">
        {tasks.map((task) => {
          const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];

          return (
            <div key={task.id} className="list-group-item border-0 py-2">
              <div className="d-flex align-items-start gap-2">
                <div className="form-check mt-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`task-${task.id}`}
                    defaultChecked={task.completed}
                    onChange={() => {
                      // TODO: Implement task toggle
                    }}
                  />
                </div>
                <div className="flex-grow-1">
                  <label
                    htmlFor={`task-${task.id}`}
                    className="form-check-label fw-medium cursor-pointer"
                  >
                    {task.title}
                  </label>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <Badge variant={priority.color as any} className="small">
                      <i className={`${priority.icon} fs-12 me-1`}></i>
                      {priority.label}
                    </Badge>
                    <small className="text-muted">
                      <i className="ti ti-calendar fs-12 me-1"></i>
                      {task.dueDate.toLocaleDateString('ro-RO')}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}

export default TasksWidget;
