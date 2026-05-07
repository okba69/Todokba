import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Link2 } from 'lucide-react';
import { useStore, priorityColor } from '../store';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ReportsView() {
  const { state, isTaskBlocked } = useStore();

  const total = state.tasks.filter(t => !t.parentId).length;
  const completed = state.tasks.filter(t => !t.parentId && t.completed).length;
  const today = format(new Date(), 'yyyy-MM-dd');
  const overdue = state.tasks.filter(t => !t.parentId && !t.completed && t.dueDate && t.dueDate < today).length;
  const blocked = state.tasks.filter(t => !t.parentId && !t.completed && isTaskBlocked(t.id)).length;
  const withDeps = state.tasks.filter(t => !t.parentId && (t.dependsOn.length > 0 || t.blocks.length > 0)).length;

  // Completions by day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const count = state.tasks.filter(t => t.completedAt && t.completedAt.startsWith(dateStr)).length;
    return { label: format(d, 'EEE', { locale: fr }), count };
  });
  const maxCount = Math.max(...last7.map(d => d.count), 1);

  const byPriority = [1, 2, 3, 4].map(p => ({
    p,
    count: state.tasks.filter(t => !t.parentId && !t.completed && t.priority === p).length,
  }));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Rapports</h1>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard icon={<CheckCircle2 size={18} className="text-green-500" />} label="Terminées" value={`${completed}/${total}`} sub={`${total > 0 ? Math.round(completed / total * 100) : 0}%`} />
          <StatCard icon={<AlertTriangle size={18} className="text-red-400" />} label="En retard" value={overdue} sub="tâches" />
          <StatCard icon={<Clock size={18} className="text-orange-400" />} label="Bloquées" value={blocked} sub="en attente" />
          <StatCard icon={<Link2 size={18} className="text-blue-400" />} label="Avec dépendances" value={withDeps} sub="liées" />
        </div>

        {/* Activity chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Activité — 7 derniers jours</h2>
          <div className="flex items-end gap-2 h-20">
            {last7.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-red-400 transition-all"
                  style={{ height: `${(d.count / maxCount) * 64}px`, minHeight: d.count > 0 ? 4 : 0 }}
                />
                <span className="text-xs text-gray-400 capitalize">{d.label}</span>
                {d.count > 0 && <span className="text-xs text-gray-500 font-medium">{d.count}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* By priority */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Tâches actives par priorité</h2>
          <div className="space-y-2">
            {byPriority.map(({ p, count }) => (
              <div key={p} className="flex items-center gap-3">
                <span className="text-xs font-medium w-6" style={{ color: priorityColor(p as any) }}>P{p}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${total > 0 ? (count / (total - completed)) * 100 : 0}%`, background: priorityColor(p as any) }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label} <span className="text-gray-400">· {sub}</span></p>
      </div>
    </div>
  );
}
