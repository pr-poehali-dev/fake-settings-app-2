import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'error' | 'info';
}

interface Settings {
  notifications: boolean;
  autoSync: boolean;
  darkMode: boolean;
  soundEffects: boolean;
  analytics: boolean;
}

interface AppData {
  programLinked: boolean;
  programName: string;
  settings: Settings;
  logs: LogEntry[];
}

const STORAGE_KEY = 'control-panel-data';

const Index = () => {
  const [programLinked, setProgramLinked] = useState(false);
  const [programName, setProgramName] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), action: 'Приложение запущено', status: 'success' }
  ]);

  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    autoSync: false,
    darkMode: true,
    soundEffects: true,
    analytics: false,
  });

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data: AppData = JSON.parse(savedData);
        setProgramLinked(data.programLinked);
        setProgramName(data.programName);
        setSettings(data.settings);
        setLogs(data.logs);
        addLog('Данные загружены из памяти', 'success');
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        addLog('Ошибка загрузки данных', 'error');
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave: AppData = {
      programLinked,
      programName,
      settings,
      logs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [programLinked, programName, settings, logs]);

  const addLog = (action: string, status: 'success' | 'error' | 'info') => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      action,
      status
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const handleLinkProgram = () => {
    if (!programName.trim()) {
      toast.error('Введите название программы');
      addLog('Попытка привязки без названия программы', 'error');
      return;
    }
    setProgramLinked(true);
    toast.success(`Программа "${programName}" успешно привязана!`);
    addLog(`Программа "${programName}" привязана`, 'success');
  };

  const handleUnlinkProgram = () => {
    setProgramLinked(false);
    setProgramName('');
    toast.info('Программа отключена');
    addLog('Программа отключена', 'info');
  };

  const handleSettingToggle = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    addLog(`Настройка "${key}" изменена на ${value ? 'вкл' : 'выкл'}`, 'info');
  };

  const handleExportConfig = () => {
    const dataToExport: AppData = {
      programLinked,
      programName,
      settings,
      logs,
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `control-panel-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Конфигурация экспортирована!');
    addLog('Конфигурация экспортирована в файл', 'success');
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: AppData = JSON.parse(e.target?.result as string);
        setProgramLinked(data.programLinked);
        setProgramName(data.programName);
        setSettings(data.settings);
        setLogs(data.logs);
        toast.success('Конфигурация импортирована!');
        addLog('Конфигурация загружена из файла', 'success');
      } catch (error) {
        toast.error('Ошибка чтения файла');
        addLog('Ошибка импорта конфигурации', 'error');
      }
    };
    reader.readAsText(file);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Control Panel
          </h1>
          <p className="text-muted-foreground text-lg">Управление программами и настройками</p>
        </div>

        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="main" className="flex items-center gap-2">
              <Icon name="Home" size={18} />
              <span className="hidden sm:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Icon name="Settings" size={18} />
              <span className="hidden sm:inline">Настройки</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Icon name="MessageSquare" size={18} />
              <span className="hidden sm:inline">Переписка</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-6">
            <Card className="border-2 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Link" size={24} className="text-primary" />
                  Привязка программы
                </CardTitle>
                <CardDescription>
                  Подключите программу для управления через панель
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!programLinked ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="program-name">Название программы</Label>
                      <Input
                        id="program-name"
                        placeholder="Введите название..."
                        value={programName}
                        onChange={(e) => setProgramName(e.target.value)}
                        className="text-lg"
                      />
                    </div>
                    <Button
                      onClick={handleLinkProgram}
                      size="lg"
                      className="w-full text-lg font-semibold h-16 animate-pulse-glow hover:scale-105 transition-transform"
                    >
                      <Icon name="Zap" size={24} className="mr-2" />
                      Привязать программу
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/30">
                      <div className="flex items-center gap-3">
                        <Icon name="CheckCircle2" size={32} className="text-green-400" />
                        <div>
                          <p className="text-xl font-bold">{programName}</p>
                          <p className="text-sm text-muted-foreground">Активна и подключена</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                        Работает
                      </Badge>
                    </div>
                    <Button
                      onClick={handleUnlinkProgram}
                      variant="destructive"
                      size="lg"
                      className="w-full"
                    >
                      <Icon name="Unlink" size={20} className="mr-2" />
                      Отключить программу
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Activity" size={24} className="text-secondary" />
                  Логи операций
                </CardTitle>
                <CardDescription>
                  Реальное время • {logs.length} записей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                      >
                        <Badge variant="outline" className={getStatusColor(log.status)}>
                          {log.timestamp}
                        </Badge>
                        <p className="flex-1 text-sm">{log.action}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="border-2 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Database" size={24} className="text-secondary" />
                  Управление конфигурацией
                </CardTitle>
                <CardDescription>
                  Экспорт и импорт всех настроек для переноса
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleExportConfig}
                    variant="outline"
                    size="lg"
                    className="h-24 flex-col gap-2"
                  >
                    <Icon name="Download" size={32} className="text-primary" />
                    <div>
                      <p className="font-semibold">Экспорт конфигурации</p>
                      <p className="text-xs text-muted-foreground">Сохранить в файл</p>
                    </div>
                  </Button>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportConfig}
                      className="hidden"
                    />
                    <div className="h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                      <Icon name="Upload" size={32} className="text-secondary" />
                      <div className="text-center">
                        <p className="font-semibold">Импорт конфигурации</p>
                        <p className="text-xs text-muted-foreground">Загрузить из файла</p>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💾 Файл конфигурации содержит все ваши настройки, привязанные программы и логи. 
                    Скопируйте файл вместе с приложением для переноса на другой ПК.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Sliders" size={24} className="text-primary" />
                  Системные настройки
                </CardTitle>
                <CardDescription>
                  Настройте работу приложения под себя
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <Label htmlFor="notifications" className="text-base font-semibold">
                      Уведомления
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Получать оповещения о событиях
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingToggle('notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <Label htmlFor="autoSync" className="text-base font-semibold">
                      Автосинхронизация
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Автоматически обновлять данные
                    </p>
                  </div>
                  <Switch
                    id="autoSync"
                    checked={settings.autoSync}
                    onCheckedChange={(checked) => handleSettingToggle('autoSync', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <Label htmlFor="darkMode" className="text-base font-semibold">
                      Тёмная тема
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Включить режим для работы ночью
                    </p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingToggle('darkMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <Label htmlFor="soundEffects" className="text-base font-semibold">
                      Звуковые эффекты
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Проигрывать звуки при действиях
                    </p>
                  </div>
                  <Switch
                    id="soundEffects"
                    checked={settings.soundEffects}
                    onCheckedChange={(checked) => handleSettingToggle('soundEffects', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <Label htmlFor="analytics" className="text-base font-semibold">
                      Аналитика
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Собирать статистику использования
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={settings.analytics}
                    onCheckedChange={(checked) => handleSettingToggle('analytics', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <Card className="border-2 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Send" size={24} className="text-secondary" />
                  Telegram бот
                </CardTitle>
                <CardDescription>
                  Подключите бота для получения уведомлений
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/20">
                      <Icon name="Bot" size={32} className="text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold">@YourControlBot</h3>
                      <p className="text-sm text-muted-foreground">
                        Отправьте команду /start боту, чтобы начать получать уведомления о действиях в приложении
                      </p>
                      <Button className="mt-4" variant="secondary">
                        <Icon name="ExternalLink" size={18} className="mr-2" />
                        Открыть бота в Telegram
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Icon name="Sparkles" size={18} className="text-primary" />
                    Возможности бота
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Icon name="CheckCircle2" size={16} className="text-green-400" />
                      Уведомления о привязке программ
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="CheckCircle2" size={16} className="text-green-400" />
                      Алерты о критических событиях
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="CheckCircle2" size={16} className="text-green-400" />
                      Удалённое управление настройками
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="CheckCircle2" size={16} className="text-green-400" />
                      Статистика работы системы
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;