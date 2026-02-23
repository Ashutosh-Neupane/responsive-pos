"use client";

import { useEffect, useState } from "react";
import { useKOTStore } from "@/lib/store";
import { useTranslation } from "@/lib/useTranslation";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KOTNotification() {
  const { t } = useTranslation();
  const { kots, updateKOTStatus } = useKOTStore();
  const [readyKOTs, setReadyKOTs] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const ready = kots.filter(k => k.status === 'ready' && !dismissed.includes(k.id));
    setReadyKOTs(ready.map(k => k.id));
  }, [kots, dismissed]);

  const handleDismiss = (kotId: string) => {
    setDismissed([...dismissed, kotId]);
    updateKOTStatus(kotId, 'served');
  };

  if (readyKOTs.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {readyKOTs.map(kotId => {
        const kot = kots.find(k => k.id === kotId);
        if (!kot) return null;

        return (
          <div key={kotId} className="bg-green-600 text-white rounded-lg shadow-xl p-4 animate-bounce">
            <div className="flex items-start gap-3">
              <Bell className="h-6 w-6 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{t('kitchen.orderReady')}</h3>
                <p className="text-sm">KOT #{kot.kot_number}</p>
                {kot.table_number && <p className="text-sm">{t('pos.table')} {kot.table_number}</p>}
              </div>
              <Button
                size="sm"
                onClick={() => handleDismiss(kotId)}
                className="bg-white text-green-600 hover:bg-green-50"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
