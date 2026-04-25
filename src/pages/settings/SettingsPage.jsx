import { useEffect, useState } from 'react';
import { Settings, User, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

export default function SettingsPage() {
  const { profile, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
  });
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  useEffect(() => {
    setProfileData({
      name: profile?.name || '',
      phone: profile?.phone || '',
    });
  }, [profile?.name, profile?.phone]);

  const handleProfileUpdate = () => {
    updateProfile.mutate(profileData);
  };

  const handleChangePassword = () => {
    setPasswordError('');
    if (passwords.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    changePassword.mutate(passwords.newPassword);
    setPasswords({ newPassword: '', confirmPassword: '' });
  };

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab Navigation */}
        <div className="md:w-60 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card hover={false}>
                <h2 className="text-lg font-semibold text-text-primary mb-6">Profile Settings</h2>

                <div className="flex items-center gap-4 mb-6">
                  <Avatar name={profile?.name} src={profile?.avatar_url} size="xl" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{profile?.name}</p>
                    <p className="text-xs text-text-muted">{profile?.email}</p>
                    <p className="text-xs text-text-muted capitalize mt-0.5">{profile?.role}</p>
                  </div>
                </div>

                <div className="space-y-4 max-w-md">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                  <Input
                    label="Phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                  <Button onClick={handleProfileUpdate} loading={updateProfile.isPending}>
                    Save Changes
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card hover={false}>
                <h2 className="text-lg font-semibold text-text-primary mb-6">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <Input
                    label="New Password"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    error={passwordError}
                  />
                  <Button onClick={handleChangePassword} loading={changePassword.isPending}>
                    Update Password
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
