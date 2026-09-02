import React from 'react';
import { Task, TaskStatus } from '../../types';
import { PriorityBadge } from '../ui/PriorityBadge';
import { Avatar } from '../ui/Avatar';
import { formatDate } from '../../utils/formatters';
import { Plus, Calendar, Clock } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
      {COLUMNS.map(column => {
        const columnTasks = tasks.filter(t => t.status === column.id);

        return (
          <div
            key={column.id}
            className={`flex flex-col rounded-xl border border-slate-200/80 p-3 min-w-[260px] ${column.bg}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${column.dot}`} />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {column.label}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white border border-slate-200 text-slate-600 shadow-2xs">
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onAddTask(column.id)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-white/80 transition"
                title={`Add task to ${column.label}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards */}
            <div className="space-y-2.5 min-h-[120px]">
              {columnTasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => onTaskClick(task)}
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
                            <Calendar className="w-3 h-3" />
                            {formatDate(task.dueDate, 'MMM d')}
                          </span>
                        )}

                        {task.estimatedHours && (
                          <span className="flex items-center gap-0.5 text-slate-400" title="Estimated hours">
                            <Clock className="w-3 h-3" />
                            {task.estimatedHours}h
                          </span>
                        )}
                      </div>

                      {task.assignee ? (
                        <Avatar name={task.assignee.name} src={task.assignee.avatarUrl} size="xs" />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                      )}
                    </div>

                    {/* Quick Move Status Trigger */}
                    <div className="mt-2 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Move to:</span>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        {COLUMNS.filter(c => c.id !== column.id).map(col => (
                          <button
                            key={col.id}
                            onClick={() => onStatusChange(task.id, col.id)}
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                            title={`Move to ${col.label}`}
                          >
                            {col.label.substring(0, 4)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {columnTasks.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  No tasks in {column.label.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
