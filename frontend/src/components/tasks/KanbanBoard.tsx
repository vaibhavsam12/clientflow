import React from 'react';
import { Task, TaskStatus } from '../../types';
import { PriorityBadge } from '../ui/PriorityBadge';
import { Avatar } from '../ui/Avatar';
import { formatDate } from '../../utils/formatters';
import { Plus, Calendar, Clock, ArrowRightLeft } from 'lucide-react';

export interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; bg: string; dot: string }[] = [
  { id: 'TODO', label: 'To Do', bg: 'bg-slate-100/70', dot: 'bg-slate-400' },
  { id: 'IN_PROGRESS', label: 'In Progress', bg: 'bg-blue-50/50', dot: 'bg-blue-500' },
  { id: 'BLOCKED', label: 'Blocked', bg: 'bg-rose-50/50', dot: 'bg-rose-500' },
  { id: 'IN_REVIEW', label: 'In Review', bg: 'bg-amber-50/50', dot: 'bg-amber-500' },
  { id: 'DONE', label: 'Done', bg: 'bg-emerald-50/50', dot: 'bg-emerald-500' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onAddTask
}) => {
  return (
    <section aria-label="Kanban Task Board" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
      {COLUMNS.map(column => {
        const columnTasks = tasks.filter(t => t.status === column.id);

        return (
          <div
            key={column.id}
            role="region"
            aria-label={`${column.label} column, ${columnTasks.length} tasks`}
            className={`flex flex-col rounded-xl border border-slate-200/80 p-3 min-w-[260px] ${column.bg}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${column.dot}`} aria-hidden="true" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {column.label}
                </h3>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white border border-slate-200 text-slate-600 shadow-2xs">
                  {columnTasks.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onAddTask(column.id)}
                aria-label={`Add task to ${column.label}`}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-white/80 transition focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Task Cards Container */}
            <div className="space-y-2.5 min-h-[120px]">
              {columnTasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

                return (
                  <div
                    key={task.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Task: ${task.title}. Priority: ${task.priority}. Status: ${column.label}. Press Enter or Space to open details.`}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onTaskClick(task);
                      }
                    }}
                    onClick={() => onTaskClick(task)}
                    className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-brand-500 focus:outline-none"
                  >
                    {/* Project Chip & Priority */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded truncate max-w-[140px]">
                        {task.project?.name || 'Project'}
                      </span>
                      <PriorityBadge priority={task.priority} showIcon={false} className="text-[10px] py-0 px-1.5" />
                    </div>

                    {/* Task Title */}
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-brand-600 transition leading-snug line-clamp-2">
                      {task.title}
                    </h4>

                    {/* Metadata & Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        {task.dueDate && (
                          <span
                            className={`flex items-center gap-1 font-medium ${
                              isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                            }`}
                          >
                            <Calendar className="w-3 h-3" aria-hidden="true" />
                            <span>{formatDate(task.dueDate, 'MMM d')}</span>
                          </span>
                        )}

                        {task.estimatedHours && (
                          <span className="flex items-center gap-0.5 text-slate-400" title="Estimated hours">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <span>{task.estimatedHours}h</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Accessible Move Dropdown for Keyboard & Assistive Tech */}
                        <div
                          className="relative"
                          onClick={e => e.stopPropagation()}
                          onKeyDown={e => e.stopPropagation()}
                        >
                          <label htmlFor={`move-task-${task.id}`} className="sr-only">
                            Move task status for {task.title}
                          </label>
                          <div className="flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-[10px]">
                            <ArrowRightLeft className="w-2.5 h-2.5 text-slate-400 mr-1" aria-hidden="true" />
                            <select
                              id={`move-task-${task.id}`}
                              value={task.status}
                              onChange={e => {
                                onStatusChange(task.id, e.target.value as TaskStatus);
                              }}
                              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                              aria-label={`Change status for ${task.title}`}
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="BLOCKED">Blocked</option>
                              <option value="IN_REVIEW">In Review</option>
                              <option value="DONE">Done</option>
                            </select>
                          </div>
                        </div>

                        {task.assignee ? (
                          <Avatar
                            name={task.assignee.name}
                            src={task.assignee.avatarUrl}
                            size="xs"
                          />
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400" title="Unassigned">
                            ?
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {columnTasks.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200/80 rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
};
