import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Edit2, MessageSquare, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import TicketForm from '../../components/tickets/TicketForm';
import { useTicket, useUpdateTicket, useAddTicketComment } from '../../hooks/useTickets';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatRelative } from '../../lib/utils';
import { STATUS_COLORS, TICKET_STATUSES } from '../../constants';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { data: ticket, isLoading } = useTicket(id);
  const updateTicket = useUpdateTicket();
  const addComment = useAddTicketComment();
  const [editing, setEditing] = useState(false);
  const [commentText, setCommentText] = useState('');

  if (isLoading) {
    return <PageWrapper><Skeleton variant="heading" className="mb-6" /><Skeleton variant="card" className="h-64" /></PageWrapper>;
  }

  if (!ticket) {
    return <PageWrapper><div className="text-center py-20"><p className="text-text-muted">Ticket not found</p><Button variant="ghost" onClick={() => navigate('/tickets')} className="mt-4">Back</Button></div></PageWrapper>;
  }

  const handleUpdate = async (data) => {
    await updateTicket.mutateAsync({ id: ticket.id, ...data });
    setEditing(false);
  };

  const handleStatusChange = async (newStatus) => {
    await updateTicket.mutateAsync({ id: ticket.id, status: newStatus });
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await addComment.mutateAsync({ ticket_id: ticket.id, content: commentText, user_id: user.id });
    setCommentText('');
  };

  return (
    <PageWrapper>
      <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card hover={false}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-text-primary">{ticket.title}</h1>
                <div className="flex gap-2 mt-2">
                  <Badge color={STATUS_COLORS[ticket.status] || 'muted'}>{ticket.status?.replace(/_/g, ' ')}</Badge>
                  <Badge color={STATUS_COLORS[ticket.priority] || 'muted'} variant="outline">{ticket.priority}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {isAdmin && <Button variant="ghost" size="sm" icon={Edit2} onClick={() => setEditing(true)}>Edit</Button>}
                {ticket.status !== 'completed' && (
                  <Button variant="secondary" size="sm" icon={CheckCircle} onClick={() => handleStatusChange('completed')} loading={updateTicket.isPending}>
                    Complete
                  </Button>
                )}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-elevated">
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </Card>

          {/* Comments */}
          <Card hover={false}>
            <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Comments
            </h3>
            <div className="space-y-3 mb-4">
              {(!ticket.comments || ticket.comments.length === 0) ? (
                <p className="text-sm text-text-muted text-center py-4">No comments yet</p>
              ) : (
                ticket.comments.map((comment, i) => (
                  <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-3 p-3 rounded-xl bg-elevated">
                    <Avatar name={comment.profile?.name} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-text-primary">{comment.profile?.name}</span>
                        <span className="text-xs text-text-muted">{formatRelative(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-text-secondary">{comment.content}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea placeholder="Add a comment..." rows={2} value={commentText} onChange={(e) => setCommentText(e.target.value)} />
              </div>
              <Button size="sm" onClick={handleComment} loading={addComment.isPending} className="self-end">Send</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card hover={false}>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Details</h3>
            <div className="space-y-3">
              <div><p className="text-xs text-text-muted">Assigned To</p><p className="text-sm text-text-primary">{ticket.assigned_to_profile?.name || '—'}</p></div>
              <div><p className="text-xs text-text-muted">Due Date</p><p className="text-sm text-text-primary">{formatDate(ticket.due_date)}</p></div>
              <div><p className="text-xs text-text-muted">Created</p><p className="text-sm text-text-primary">{formatDate(ticket.created_at)}</p></div>
              <div>
                <p className="text-xs text-text-muted mb-1">Status</p>
                <Select
                  options={TICKET_STATUSES}
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit Ticket" size="lg">
        <TicketForm initialData={ticket} onSubmit={handleUpdate} loading={updateTicket.isPending} />
      </Modal>
    </PageWrapper>
  );
}
