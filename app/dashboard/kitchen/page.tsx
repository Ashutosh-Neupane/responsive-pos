"use client";

import { useKOTStore, useAuthStore } from "@/lib/store";
import { useTranslation } from "@/lib/useTranslation";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, ChefHat } from "lucide-react";

export default function KitchenPage() {
  const { t } = useTranslation();
  const { kots, updateKOTStatus, getActiveKOTs } = useKOTStore();
  const { shop } = useAuthStore();

  const activeKOTs = getActiveKOTs();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 border-red-500 text-red-900';
      case 'preparing': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'ready': return 'bg-green-100 border-green-500 text-green-900';
      default: return 'bg-slate-100 border-slate-500 text-slate-900';
    }
  };

  const handleStatusChange = (kotId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'preparing' : 'ready';
    updateKOTStatus(kotId, nextStatus as any);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-orange-600 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <ChefHat className="h-6 w-6" />
            <h1 className="text-xl font-bold">{t('kitchen.title')}</h1>
            <span className="ml-auto bg-white text-orange-600 px-3 py-1 rounded-full font-bold">
              {activeKOTs.length} {t('kitchen.active')}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {activeKOTs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ChefHat className="h-24 w-24 text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">{t('kitchen.noOrders')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeKOTs.map(kot => (
                <div key={kot.id} className={`border-2 rounded-lg p-4 ${getStatusColor(kot.status)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">KOT #{kot.kot_number}</h3>
                      {kot.table_number && (
                        <p className="text-sm font-semibold">Table {kot.table_number}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {new Date(kot.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {kot.items.map(item => (
                      <div key={item.id} className="bg-white/50 rounded p-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{item.product_name}</span>
                          <span className="font-bold">x{item.quantity}</span>
                        </div>
                        {item.notes && (
                          <p className="text-xs mt-1 italic">Note: {item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleStatusChange(kot.id, kot.status)}
                    className={`w-full ${
                      kot.status === 'pending' 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {kot.status === 'pending' && (
                      <>
                        <ChefHat className="h-4 w-4 mr-2" />
                        {t('kitchen.startPreparing')}
                      </>
                    )}
                    {kot.status === 'preparing' && (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('kitchen.markReady')}
                      </>
                    )}
                    {kot.status === 'ready' && (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('kitchen.readyForPickup')}
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
