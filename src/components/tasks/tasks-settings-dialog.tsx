import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/hooks/use-i18n';
import { Save, Settings } from 'lucide-react';

// Interface para as configurações
export interface TaskSettings {
  autoSave: boolean;
  notifications: boolean;
  showCompleted: boolean;
}

// Hook para usar as configurações em outros componentes
export const useTaskSettings = () => {
  const getSettings = (): TaskSettings => {
    try {
      const saved = localStorage.getItem('isacar-task-settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao carregar configurações:', e);
    }
    return { autoSave: true, notifications: true, showCompleted: true };
  };

  const [settings, setSettings] = useState<TaskSettings>(getSettings);

  useEffect(() => {
    const handleStorage = () => setSettings(getSettings());
    window.addEventListener('task-settings-changed', handleStorage);
    return () => window.removeEventListener('task-settings-changed', handleStorage);
  }, []);

  return settings;
};

interface TasksSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TasksSettingsDialog({ open, onOpenChange }: TasksSettingsDialogProps) {
  const { t } = useI18n();
  
  // Carregar do localStorage
  const loadSettings = (): TaskSettings => {
    try {
      const saved = localStorage.getItem('isacar-task-settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao carregar configurações:', e);
    }
    return { autoSave: true, notifications: true, showCompleted: true };
  };

  const [settings, setSettings] = useState<TaskSettings>(loadSettings);

  // Salvar no localStorage quando mudar
  const updateSetting = (key: keyof TaskSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('isacar-task-settings', JSON.stringify(newSettings));
    // Disparar evento para outros componentes
    window.dispatchEvent(new Event('task-settings-changed'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('tasks.settings.title')}
          </DialogTitle>
          <DialogDescription>
            {t('tasks.settings.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save" className="flex items-center gap-2">
                  <Save className="h-4 w-4 text-muted-foreground" />
                  {t('tasks.settings.autoSave')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('tasks.settings.autoSaveDesc')}
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">{t('tasks.settings.notifications')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('tasks.settings.notificationsDesc')}
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSetting('notifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-completed">{t('tasks.settings.showCompleted')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('tasks.settings.showCompletedDesc')}
                </p>
              </div>
              <Switch
                id="show-completed"
                checked={settings.showCompleted}
                onCheckedChange={(checked) => updateSetting('showCompleted', checked)}
              />
            </div>
          </motion.div>
          
          {/* Indicador de salvamento automático */}
          <p className="text-xs text-center text-muted-foreground">
            {t('tasks.settings.autoSaved')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

