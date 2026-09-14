import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleName } from '../types/eams';
import { db } from '../services/db';

interface AuthContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: number) => void;
  switchRole: (role: RoleName) => void;
  hasRole: (roles: RoleName | RoleName[]) => boolean;
  can: {
    manageUsers: boolean;
    createAsset: boolean;
    editAsset: boolean;
    deleteAsset: boolean;
    calculateDepreciation: boolean;
    createWorkOrder: boolean;
    assignMechanic: boolean;
    executeWorkOrder: boolean;
    approveWorkOrder: boolean;
    manageInventory: boolean;
    restockInventory: boolean;
    requestMovement: boolean;
    approveMovement: boolean;
    viewAuditLog: boolean;
    backupRestore: boolean;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  // Default to Supervisor or Admin for rich dashboard initial view
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = localStorage.getItem('eams_current_user_id');
    if (savedUserId) {
      const found = db.getUserById(Number(savedUserId));
      if (found) return found;
    }
    // Default to Ihwan Suryadi,ST. (Supervisor) or Bambang (Admin)
    return db.getUsers()[1] || db.getUsers()[0];
  });

  useEffect(() => {
    setUsers(db.getUsers());
  }, []);

  const switchUser = (userId: number) => {
    const target = db.getUserById(userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('eams_current_user_id', String(target.id));
      db.logAudit(target, 'USER_SESSION_SWITCH', 'user', target.email, `Sesi pengguna beralih ke ${target.name} (${target.role_display_name}).`);
    }
  };

  const switchRole = (role: RoleName) => {
    const userWithRole = db.getUsers().find(u => u.role === role);
    if (userWithRole) {
      switchUser(userWithRole.id);
    }
  };

  const hasRole = (roles: RoleName | RoleName[]): boolean => {
    if (currentUser.role === 'admin') return true; // Admin has superuser privileges
    if (Array.isArray(roles)) {
      return roles.includes(currentUser.role);
    }
    return currentUser.role === roles;
  };

  const role = currentUser.role;

  const can = {
    manageUsers: role === 'admin',
    createAsset: role === 'admin' || role === 'asset_specialist',
    editAsset: role === 'admin' || role === 'asset_specialist' || role === 'supervisor',
    deleteAsset: role === 'admin',
    calculateDepreciation: role === 'admin' || role === 'asset_specialist' || role === 'supervisor',
    createWorkOrder: role === 'admin' || role === 'service_coordinator' || role === 'supervisor',
    assignMechanic: role === 'admin' || role === 'service_coordinator',
    executeWorkOrder: role === 'admin' || role === 'mechanic',
    approveWorkOrder: role === 'admin' || role === 'supervisor',
    manageInventory: role === 'admin' || role === 'warehouse_specialist',
    restockInventory: role === 'admin' || role === 'warehouse_specialist',
    requestMovement: role === 'admin' || role === 'asset_specialist' || role === 'service_coordinator' || role === 'warehouse_specialist',
    approveMovement: role === 'admin' || role === 'supervisor',
    viewAuditLog: role === 'admin' || role === 'supervisor',
    backupRestore: role === 'admin',
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        switchRole,
        hasRole,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
