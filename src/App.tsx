import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MaintenanceCockpit } from './components/analytics/MaintenanceCockpit';
import { FailureRateDatabaseViewer } from './components/matrix/FailureRateDatabaseViewer';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { AssetList } from './components/assets/AssetList';
import { AssetDetailModal } from './components/assets/AssetDetailModal';
import { AssetFormModal } from './components/assets/AssetFormModal';
import { WorkOrderList } from './components/workorders/WorkOrderList';
import { WorkOrderDetailModal } from './components/workorders/WorkOrderDetailModal';
import { CreateWorkOrderModal } from './components/workorders/CreateWorkOrderModal';
import { InventoryList } from './components/inventory/InventoryList';
import { InventoryModal } from './components/inventory/InventoryModal';
import { AssetMovementList } from './components/movements/AssetMovementList';
import { CreateMovementModal } from './components/movements/CreateMovementModal';
import { DepreciationCalculator } from './components/depreciation/DepreciationCalculator';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { HandbookViewer } from './components/handbook/HandbookViewer';
import { QRScannerModal } from './components/scanner/QRScannerModal';
import { Asset, SparePart } from './types/eams';
import { db } from './services/db';

const MainAppContent: React.FC = () => {
  const { currentUser, can } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('analytics');

  // Modal States
  const [selectedAssetDetailId, setSelectedAssetDetailId] = useState<number | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null | undefined>(undefined); // undefined: closed, null: create, Asset: edit
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<number | null>(null);
  const [isCreateWOOpen, setIsCreateWOOpen] = useState<boolean>(false);
  const [initialAssetForWO, setInitialAssetForWO] = useState<number | undefined>(undefined);
  
  const [inventoryModalConfig, setInventoryModalConfig] = useState<{ isOpen: boolean; mode: 'restock' | 'create'; part?: SparePart | null }>({
    isOpen: false,
    mode: 'create',
    part: null,
  });

  const [isCreateMovementOpen, setIsCreateMovementOpen] = useState<boolean>(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);

  // Forced refresh state for triggers
  const [, setTick] = useState(0);
  const forceRefresh = () => setTick(t => t + 1);

  // Quick navigation handlers
  const handleOpenAssetDetail = (id: number) => {
    setSelectedAssetDetailId(id);
  };

  const handleOpenWorkOrderDetail = (id: number) => {
    setSelectedWorkOrderId(id);
  };

  const handleOpenCreateWO = (assetId?: number) => {
    setInitialAssetForWO(assetId);
    setIsCreateWOOpen(true);
  };

  const handleQRAssetFound = (asset: Asset) => {
    setIsQRScannerOpen(false);
    setSelectedAssetDetailId(asset.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Header
        onOpenScanner={() => setIsQRScannerOpen(true)}
        onSelectAsset={(id) => handleOpenAssetDetail(id)}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-full">
          {activeTab === 'analytics' && (
            <MaintenanceCockpit
              onSelectAsset={handleOpenAssetDetail}
              onSelectWorkOrder={handleOpenWorkOrderDetail}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'failure_rate_matrix' && (
            <FailureRateDatabaseViewer />
          )}

          {activeTab === 'dashboard' && (
            <OverviewDashboard
              onNavigate={setActiveTab}
              onSelectAsset={handleOpenAssetDetail}
              onSelectWorkOrder={handleOpenWorkOrderDetail}
              onOpenCreateWO={() => handleOpenCreateWO()}
              onOpenCreateAsset={() => setAssetToEdit(null)}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
            />
          )}

          {activeTab === 'assets' && (
            <AssetList
              onSelectAsset={handleOpenAssetDetail}
              onOpenCreateAsset={() => setAssetToEdit(null)}
            />
          )}

          {activeTab === 'work_orders' && (
            <WorkOrderList
              onSelectWorkOrder={handleOpenWorkOrderDetail}
              onOpenCreateWO={() => handleOpenCreateWO()}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryList
              onOpenRestock={(part) => setInventoryModalConfig({ isOpen: true, mode: 'restock', part })}
              onOpenCreatePart={() => setInventoryModalConfig({ isOpen: true, mode: 'create', part: null })}
            />
          )}

          {activeTab === 'movements' && (
            <AssetMovementList
              onOpenCreateMovement={() => setIsCreateMovementOpen(true)}
            />
          )}

          {activeTab === 'depreciation' && (
            <DepreciationCalculator />
          )}

          {activeTab === 'audit' && (
            <AuditLogViewer />
          )}

          {activeTab === 'handbook' && (
            <HandbookViewer />
          )}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Asset Detail Modal */}
      {selectedAssetDetailId && (
        <AssetDetailModal
          assetId={selectedAssetDetailId}
          onClose={() => setSelectedAssetDetailId(null)}
          onEdit={(asset) => {
            setSelectedAssetDetailId(null);
            setAssetToEdit(asset);
          }}
          onCreateWorkOrder={(assetId) => {
            setSelectedAssetDetailId(null);
            handleOpenCreateWO(assetId);
          }}
        />
      )}

      {/* 2. Asset Form Modal (Create / Edit) */}
      {assetToEdit !== undefined && (
        <AssetFormModal
          assetToEdit={assetToEdit}
          onClose={() => setAssetToEdit(undefined)}
          onSuccess={(asset) => {
            setAssetToEdit(undefined);
            forceRefresh();
            setSelectedAssetDetailId(asset.id);
          }}
        />
      )}

      {/* 3. Work Order Detail & Mechanic/Supervisor Execution Modal */}
      {selectedWorkOrderId && (
        <WorkOrderDetailModal
          workOrderId={selectedWorkOrderId}
          onClose={() => setSelectedWorkOrderId(null)}
          onRefresh={() => {
            forceRefresh();
          }}
        />
      )}

      {/* 4. Create Work Order Modal */}
      {isCreateWOOpen && (
        <CreateWorkOrderModal
          initialAssetId={initialAssetForWO}
          onClose={() => {
            setIsCreateWOOpen(false);
            setInitialAssetForWO(undefined);
          }}
          onSuccess={(wo) => {
            setIsCreateWOOpen(false);
            setInitialAssetForWO(undefined);
            forceRefresh();
            setSelectedWorkOrderId(wo.id);
          }}
        />
      )}

      {/* 5. Inventory Restock / Create Modal */}
      {inventoryModalConfig.isOpen && (
        <InventoryModal
          mode={inventoryModalConfig.mode}
          selectedPart={inventoryModalConfig.part}
          onClose={() => setInventoryModalConfig({ isOpen: false, mode: 'create', part: null })}
          onSuccess={() => {
            setInventoryModalConfig({ isOpen: false, mode: 'create', part: null });
            forceRefresh();
          }}
        />
      )}

      {/* 6. Asset Movement Request Modal */}
      {isCreateMovementOpen && (
        <CreateMovementModal
          onClose={() => setIsCreateMovementOpen(false)}
          onSuccess={() => {
            setIsCreateMovementOpen(false);
            forceRefresh();
          }}
        />
      )}

      {/* 7. QR Code / Barcode Scanner Modal */}
      {isQRScannerOpen && (
        <QRScannerModal
          onClose={() => setIsQRScannerOpen(false)}
          onAssetFound={handleQRAssetFound}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
