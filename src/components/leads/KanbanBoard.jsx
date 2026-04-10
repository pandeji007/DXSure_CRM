import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatCurrency, truncate } from '../../lib/utils';
import { STATUS_COLORS, LEAD_STATUSES } from '../../constants';
import { useUpdateLead } from '../../hooks/useLeads';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

const statusColumns = ['new', 'contacted', 'in_progress', 'qualified', 'converted', 'lost'];

export default function KanbanBoard({ leads = [] }) {
  const navigate = useNavigate();
  const updateLead = useUpdateLead();
  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggedLead && draggedLead.status !== newStatus) {
      await updateLead.mutateAsync({ id: draggedLead.id, status: newStatus });
    }
    setDraggedLead(null);
  };

  const getStatusLabel = (status) =>
    LEAD_STATUSES.find((s) => s.value === status)?.label || status;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusColumns.map((status) => {
        const columnLeads = leads.filter((l) => l.status === status);
        const isOver = dragOverColumn === status;

        return (
          <div
            key={status}
            className={cn(
              'flex-shrink-0 w-72 flex flex-col',
              isOver && 'opacity-80'
            )}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-text-primary">
                  {getStatusLabel(status)}
                </h3>
                <span className="text-xs bg-elevated px-2 py-0.5 rounded-full text-text-muted">
                  {columnLeads.length}
                </span>
              </div>
            </div>

            <div
              className={cn(
                'flex-1 space-y-2 p-2 rounded-xl border border-border min-h-[200px] transition-colors',
                isOver ? 'bg-primary/5 border-primary/30' : 'bg-surface/50'
              )}
            >
              {columnLeads.map((lead, i) => (
                <motion.div
                  key={lead.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  className="p-3 rounded-xl bg-card border border-border cursor-grab active:cursor-grabbing hover:border-border-hover hover:shadow-glow-sm transition-all"
                >
                  <p className="text-sm font-medium text-text-primary mb-1">
                    {truncate(lead.title, 35)}
                  </p>
                  <p className="text-xs text-text-muted mb-2">{lead.contact_name}</p>
                  <div className="flex items-center justify-between">
                    {lead.value && (
                      <span className="text-xs font-medium text-secondary">
                        {formatCurrency(lead.value)}
                      </span>
                    )}
                    <Badge
                      color={STATUS_COLORS[lead.priority] || 'muted'}
                      variant="outline"
                      className="text-[10px]"
                    >
                      {lead.priority}
                    </Badge>
                  </div>
                </motion.div>
              ))}

              {columnLeads.length === 0 && (
                <div className="flex items-center justify-center h-24 text-xs text-text-muted">
                  Drop leads here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
