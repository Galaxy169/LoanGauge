import React, { useState } from 'react';
import { Search, Shield, Ban, CheckCircle } from 'lucide-react';
import { useGetUsersQuery, useUpdateUserRoleMutation, useUpdateUserStatusMutation } from '@/services/adminApi';
import { useToastContext } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { PageLoader } from '@/components/ui/Loader';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/Table';
import { getErrorMessage } from '@/utils/helpers';

export default function AdminUsersPage() {
  const { data: usersData = [], isLoading, error } = useGetUsersQuery();
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();
  const toast = useToastContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');

  const users = Array.isArray(usersData) ? usersData : [];

  if (isLoading) return <PageLoader />;
  if (error) return <div className="p-8 text-center text-text-primary font-sans">Failed to load user directory</div>;

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleUpdateRole = async () => {
    try {
      await updateRole({ userId: selectedUser.id, roleName: newRole }).unwrap();
      toast.success(`User role updated to ${newRole.replace('_', ' ')}`);
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleToggleStatus = async (user) => {
    if (window.confirm(`Are you sure you want to ${user.status === 'ACTIVE' ? 'suspend' : 'activate'} user ${user.email}?`)) {
      try {
        const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        await updateStatus({ userId: user.id, status: newStatus }).unwrap();
        toast.success(`User status changed to ${newStatus}`);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6 font-sans text-text-primary">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Admin Directory</span>
          <h1 className="text-2xl font-bold text-text-primary mt-1 flex items-center gap-2">
            User Access Management
            <Badge variant="default">{users.length} Registered</Badge>
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">
            Manage user roles, access levels, and security account statuses across LoanGauge.
          </p>
        </div>
        <div className="w-full md:w-80">
          <Input 
            placeholder="Search by name, email, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={Search}
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-border bg-white rounded">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>User Profile</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>Account Status</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-text-muted text-xs">
                  No users found matching query "{searchTerm}"
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-text-primary text-sm">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-text-muted">{user.email}</span>
                      <span className="text-[10px] text-text-muted mt-0.5">UID: {user.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{user.role?.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.status === 'ACTIVE' ? (
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1 inline" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        <Ban className="w-3 h-3 mr-1 inline" /> Suspended
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenRoleModal(user)}
                        leftIcon={Shield}
                      >
                        Change Role
                      </Button>
                      <Button 
                        variant={user.status === 'ACTIVE' ? 'danger' : 'primary'} 
                        size="sm"
                        onClick={() => handleToggleStatus(user)}
                        isLoading={isUpdatingStatus && selectedUser?.id === user.id}
                      >
                        {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Role Change Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Change User Access Role"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-surface-sunken p-3 rounded border border-border text-xs space-y-1">
              <p className="font-bold text-text-primary text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
              <p className="text-text-muted">{selectedUser.email}</p>
              <p className="text-text-primary font-bold">Current Role: {selectedUser.role}</p>
            </div>
            
            <Select
              label="Select New System Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              options={[
                { value: 'USER', label: 'Standard User (Free Tier)' },
                { value: 'PREMIUM_USER', label: 'Premium User (Unlimited)' },
                { value: 'FINANCIAL_ADVISOR', label: 'Financial Advisor' },
                { value: 'ADMINISTRATOR', label: 'System Administrator' }
              ]}
            />
            
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleUpdateRole}
                isLoading={isUpdatingRole}
                disabled={newRole === selectedUser.role}
              >
                Update Access Role
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

