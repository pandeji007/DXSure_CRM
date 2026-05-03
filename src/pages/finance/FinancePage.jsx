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
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { FINANCE_TYPES } from '../../constants';

export default function FinancePage() {
  const { user, isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const scopedCreatedBy = isAdmin ? undefined : user?.id;
  const typeTabs = isAdmin
    ? FINANCE_TYPES
    : FINANCE_TYPES.filter((item) => ['petty_cash', 'expense'].includes(item.value));
  const { data: entries, isLoading } = useFinanceEntries(
    user ? {
      type: activeTab || undefined,
      created_by: scopedCreatedBy,
    } : null
  );
  const { data: stats } = useFinanceStats(user ? { created_by: scopedCreatedBy } : null);
  const createEntry = useCreateFinanceEntry();

  const handleCreate = async (data) => {
    await createEntry.mutateAsync({ ...data, created_by: user?.id || null });
    setShowForm(false);
  };

  const escapeCsvValue = (value) => {
    const stringValue = value == null ? '' : String(value);

    if (!/[",\n]/.test(stringValue)) {
      return stringValue;
    }

    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const handleExport = () => {
    if (!entries?.length) return;
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Impact', 'Method', 'Client'];
    const rows = entries.map((entry) =>
      [
        entry.entry_date,
        entry.type,
        entry.description,
        entry.amount,
        entry.signed_amount,
        entry.payment_method,
        entry.client?.name,
      ]
        .map(escapeCsvValue)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [{ value: '', label: 'All' }, ...typeTabs];
  const pageTitle = isAdmin ? 'Finance' : 'Petty Cash';
  const pageDescription = isAdmin
    ? 'Track payments, expenses, and revenue'
    : 'Track incoming petty cash and outgoing expenses';
  const actionLabel = isAdmin ? 'Record Entry' : 'Record Cash Entry';
  const statCards = isAdmin
    ? [
        { title: 'Total Inflow', value: formatCurrency(stats?.income || 0), icon: TrendingUp, color: 'success' },
        { title: 'Total Outflow', value: formatCurrency(stats?.expenses || 0), icon: TrendingDown, color: 'danger' },
        { title: 'Net Movement', value: formatCurrency(stats?.net || 0), icon: Wallet, color: 'primary' },
      ]
    : [
        { title: 'Cash Added', value: formatCurrency(stats?.income || 0), icon: Wallet, color: 'primary' },
        { title: 'Cash Spent', value: formatCurrency(stats?.expenses || 0), icon: TrendingDown, color: 'danger' },
        { title: 'Net Movement', value: formatCurrency(stats?.net || 0), icon: TrendingUp, color: stats?.net >= 0 ? 'success' : 'danger' },
        { title: 'Entries Logged', value: entries?.length || 0, icon: DollarSign, color: 'success' },
      ];

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-text-secondary mt-1">{pageDescription}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={Download} onClick={handleExport} disabled={!entries?.length}>
            Export CSV
          </Button>
          <Button icon={DollarSign} onClick={() => setShowForm(true)}>{actionLabel}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, index) => (
          <StatCard key={card.title} {...card} index={index} />
        ))}
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

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={actionLabel} size="lg">
        <PaymentForm
          onSubmit={handleCreate}
          loading={createEntry.isPending}
          allowedTypes={typeTabs}
          showClientField={isAdmin}
        />
      </Modal>
    </PageWrapper>
  );
}
