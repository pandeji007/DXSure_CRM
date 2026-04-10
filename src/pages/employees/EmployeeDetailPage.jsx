import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Skeleton from '../../components/ui/Skeleton';
import { useEmployee } from '../../hooks/useEmployees';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { formatDate, formatRelative } from '../../lib/utils';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(id);
  const { data: activities } = useActivityLogs({ user_id: id, limit: 20 });

  if (isLoading) {
    return <PageWrapper><Skeleton variant="heading" className="mb-6" /><Skeleton variant="card" className="h-64" /></PageWrapper>;
  }

  if (!employee) {
    return <PageWrapper><div className="text-center py-20"><p className="text-text-muted">Employee not found</p><Button variant="ghost" onClick={() => navigate('/employees')} className="mt-4">Back</Button></div></PageWrapper>;
  }

  return (
    <PageWrapper>
      <Button variant="ghost" size="sm" onClick={() => navigate('/employees')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card hover={false}>
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={employee.name} src={employee.avatar_url} size="xl" />
              <div>
                <h1 className="text-xl font-bold text-text-primary">{employee.name}</h1>
                <p className="text-sm text-text-secondary capitalize">{employee.department || 'No department'}</p>
                <Badge color={employee.role === 'admin' ? 'info' : 'muted'} className="mt-2">{employee.role}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-3 rounded-xl bg-elevated">
                <Mail className="w-4 h-4 text-primary" />
                <div><p className="text-xs text-text-muted">Email</p><p className="text-sm text-text-primary">{employee.email}</p></div>
              </motion.div>
              {employee.phone && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 p-3 rounded-xl bg-elevated">
                  <Phone className="w-4 h-4 text-secondary" />
                  <div><p className="text-xs text-text-muted">Phone</p><p className="text-sm text-text-primary">{employee.phone}</p></div>
                </motion.div>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card hover={false}>
            <h3 className="text-base font-semibold text-text-primary mb-4">Recent Activity</h3>
            {(!activities || activities.length === 0) ? (
              <p className="text-sm text-text-muted text-center py-8">No activity recorded</p>
            ) : (
              <div className="space-y-2">
                {activities.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-elevated transition-colors">
                    <span className="text-lg">📝</span>
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">{a.description || a.action}</p>
                      <p className="text-xs text-text-muted">{formatRelative(a.created_at)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card hover={false}>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Details</h3>
            <div className="space-y-3">
              <div><p className="text-xs text-text-muted">Department</p><p className="text-sm text-text-primary capitalize">{employee.department || '—'}</p></div>
              <div><p className="text-xs text-text-muted">Joined</p><p className="text-sm text-text-primary">{formatDate(employee.created_at)}</p></div>
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
