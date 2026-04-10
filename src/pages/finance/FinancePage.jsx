import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Download } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import PaymentForm from '../../components/finance/PaymentForm';
import DayBook from '../../components/finance/DayBook';
import FinanceChart from '../../components/finance/FinanceChart';
import StatCard from '../../components/dashboard/StatCard';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useFinanceEntries, useCreateFinanceEntry, useFinanceStats } from '../../hooks/useFinance';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { FINANCE_TYPES } from '../../constants';

export default function FinancePage() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const { data: entries, isLoading } = useFinanceEntries({ type: activeTab || undefined });
  const { data: stats } = useFinanceStats();
  const createEntry = useCreateFinanceEntry();

  const handleCreate = async (data) => {
    await createEntry.mutateAsync(data);
    setShowForm(false);
  };

  const handleExport = () => {
    if (!entries?.length) return;
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Method', 'Client'];
    const rows = entries.map(e => [e.entry_date, e.type, e.description, e.amount, e.payment_method, e.client?.name].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [{ value: '', label: 'All' }, ...FINANCE_TYPES];

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Finance</h1>
          <p className="text-sm text-text-secondary mt-1">Track payments, expenses, and revenue</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={Download} onClick={handleExport}>Export CSV</Button>
          <Button icon={DollarSign} onClick={() => setShowForm(true)}>Record Entry</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Income" value={formatCurrency(stats?.income || 0)} icon={TrendingUp} color="success" index={0} />
        <StatCard title="Total Expenses" value={formatCurrency(stats?.expenses || 0)} icon={TrendingDown} color="danger" index={1} />
        <StatCard title="Net Balance" value={formatCurrency(stats?.net || 0)} icon={Wallet} color="primary" index={2} />
      </div>

      <div className="mb-8">
        <FinanceChart data={stats?.entries} loading={!stats} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
              activeTab === tab.value ? 'bg-primary text-white border-primary' : 'bg-transparent text-text-secondary border-border hover:text-text-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DayBook data={entries} loading={isLoading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Record Finance Entry" size="lg">
        <PaymentForm onSubmit={handleCreate} loading={createEntry.isPending} />
      </Modal>
    </PageWrapper>
  );
}
