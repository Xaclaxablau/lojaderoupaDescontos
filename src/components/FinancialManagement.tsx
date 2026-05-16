import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import phpserver from '@/lib/phpserver';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  Pencil,
  Trash2,
  Archive,
  RefreshCcw,
  Banknote,
  CircleDashed,
  BarChart3,
  Plus
} from 'lucide-react';
import { formatCurrency, debounce } from '@/lib/performance';
import { getFromStorage, saveToStorage } from '@/lib/storageOptimizer';

// Função para gerar IDs únicos baseados em timestamp
const generateId = () => `finance-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Define os tipos para os registros financeiros
interface FinancialRecord {
  id: string;
  description: string;
  amount: number;
  date: string;
  dueDate?: string;
  category: 'RECEITA' | 'DESPESA' | 'FIXO' | 'A RECEBER';
  notes?: string;
  archived: boolean;
  paid: boolean;
}

const FinancialManagement = () => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<FinancialRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [totalFixed, setTotalFixed] = useState(0);
  const [balance, setBalance] = useState(0);
  const [carregando, setCarregando] = useState(true);
  // Carregar registros do localStorage
  useEffect(() => {
    async function syncFinanceiros() {
      try {
        const records = await phpserver().getFinanceiro();
        localStorage.setItem('financialRecords', JSON.stringify(records));
        setRecords(records);
        setCarregando(false);
      } catch (e) {
        console.error('Falha ao carregar registros financeiros', e);
        setRecords([]);
      }
    }
    syncFinanceiros();
  }, []);

  // Memoizar os registros ativos para cálculos
  const activeRecords = useMemo(() =>
    records.filter(r => !r.archived),
    [records]);

  // Filtrar registros conforme a aba selecionada (memoizado)
  useEffect(() => {
    let filtered = showArchived ? [...records] : [...activeRecords];

    if (selectedTab !== 'all') {
      filtered = filtered.filter(record => record.category === selectedTab);
    }

    setFilteredRecords(filtered);
  }, [records, activeRecords, selectedTab, showArchived]);

  // Calcular totais para o dashboard (memoizado)
  useEffect(() => {
    // Memoizar os cálculos de valores financeiros
    const revenue = activeRecords
      .filter(r => r.category === 'RECEITA' && r.paid)
      .reduce((sum, record) => sum + record.amount, 0);

    const expenses = activeRecords
      .filter(r => (r.category === 'DESPESA' || r.category === 'FIXO') && !r.paid)
      .reduce((sum, record) => sum + record.amount, 0);

    const receivable = activeRecords
      .filter(r => r.category === 'A RECEBER' && !r.paid)
      .reduce((sum, record) => sum + record.amount, 0);

    const fixed = activeRecords
      .filter(r => r.category === 'FIXO' && !r.paid)
      .reduce((sum, record) => sum + record.amount, 0);

    const paidExpenses = activeRecords
      .filter(r => (r.category === 'DESPESA' || r.category === 'FIXO') && r.paid)
      .reduce((sum, record) => sum + record.amount, 0);

    // Atualizar os estados em lote para reduzir renderizações
    setTotalRevenue(revenue);
    setTotalExpenses(expenses);
    setTotalReceivable(receivable);
    setTotalFixed(fixed);
    setBalance(revenue - paidExpenses);
  }, [activeRecords]);

  // Salvar registros no localStorage - memoizar para performance e usar debounce
  const saveRecords = useCallback(
    debounce(async (updatedRecords: FinancialRecord[]) => {
      try {
        await phpserver().updateFinanceiro(updatedRecords);
        const success = saveToStorage('financialRecords', updatedRecords);
        if (success) {
          setRecords(updatedRecords);
          toast.success('Registros financeiros atualizados');
        } else {
          throw new Error('Falha ao salvar no storage');
        }
      } catch (e) {
        console.error('Falha ao salvar registros financeiros', e);
        toast.error('Erro ao salvar registros');
      }
    }, 300), // 300ms de debounce
    []
  );

  // Adicionar novo registro
  const handleNewRecord = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newRecord: FinancialRecord = {
      id: generateId(),
      description: '',
      amount: 0,
      date: today,
      dueDate: today,
      category: 'RECEITA',
      notes: '',
      archived: false,
      paid: false
    };

    setEditingRecord(newRecord);
    setIsDialogOpen(true);
  };

  // Editar registro existente
  const handleEditRecord = (record: FinancialRecord) => {
    setEditingRecord({ ...record });
    setIsDialogOpen(true);
  };

  // Salvar registro
  const handleSaveRecord = () => {
    if (!editingRecord) return;

    // Validação básica
    if (!editingRecord.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    if (editingRecord.amount <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }

    // Se for A RECEBER e estiver marcado como pago, converter para RECEITA
    let recordToSave = { ...editingRecord };
    if (recordToSave.category === 'A RECEBER' && recordToSave.paid) {
      recordToSave.category = 'RECEITA';
      toast.info('Item "A RECEBER" foi convertido para "RECEITA" por estar marcado como pago');
    }

    // Se for RECEITA, garantir que esteja marcado como pago
    if (recordToSave.category === 'RECEITA' && !recordToSave.paid) {
      recordToSave.paid = true;
      toast.info('Receitas são automaticamente marcadas como pagas');
    }

    const updatedRecords = [...records];
    const existingIndex = updatedRecords.findIndex(r => r.id === recordToSave.id);

    if (existingIndex >= 0) {
      updatedRecords[existingIndex] = recordToSave;
    } else {
      updatedRecords.push(recordToSave);
    }

    saveRecords(updatedRecords);
    setIsDialogOpen(false);
    setEditingRecord(null);
  };

  // Arquivar registro
  const handleArchiveRecord = (id: string) => {
    const updatedRecords = [...records];
    const index = updatedRecords.findIndex(r => r.id === id);

    if (index >= 0) {
      updatedRecords[index] = {
        ...updatedRecords[index],
        archived: true
      };

      saveRecords(updatedRecords);
      toast.success('Registro arquivado');
    }
  };

  // Restaurar registro arquivado
  const handleRestoreRecord = (id: string) => {
    const updatedRecords = [...records];
    const index = updatedRecords.findIndex(r => r.id === id);

    if (index >= 0) {
      updatedRecords[index] = {
        ...updatedRecords[index],
        archived: false
      };

      saveRecords(updatedRecords);
      toast.success('Registro restaurado');
    }
  };

  // Excluir registro
  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      const updatedRecords = records.filter(r => r.id !== id);
      saveRecords(updatedRecords);
      toast.success('Registro excluído');
    }
  };

  // Alternar status de pagamento
  const handleTogglePaid = (id: string) => {
    const record = records.find(r => r.id === id);
    if (!record) return;

    let updatedRecord = { ...record, paid: !record.paid };

    // Se for A RECEBER e estiver sendo marcado como pago, converter para RECEITA
    if (record.category === 'A RECEBER' && !record.paid) {
      updatedRecord.category = 'RECEITA';
      toast.success(`${record.description} foi marcado como pago e convertido para RECEITA`);
    }
    // Se for RECEITA e estiver sendo desmarcado como pago, não permitir
    else if (record.category === 'RECEITA' && record.paid) {
      toast.error('Receitas não podem ser marcadas como não pagas');
      return;
    }
    // Outros casos - apenas alterna o estado de pagamento
    else {
      if (updatedRecord.paid) {
        toast.success(`${record.description} foi marcado como pago`);
      } else {
        toast.success(`${record.description} foi marcado como não pago`);
      }
    }

    const updatedRecords = records.map(r =>
      r.id === id ? updatedRecord : r
    );

    saveRecords(updatedRecords);
  };

  if (carregando) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white text-gray-700">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold">Aguarde um momento...</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Gerenciamento Financeiro</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleNewRecord}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={16} className="mr-2" />
            Novo Registro
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
            className="border-blue-600 text-blue-600"
          >
            {showArchived ? 'Ocultar Arquivados' : 'Mostrar Arquivados'}
          </Button>
        </div>
      </div>

      {/* Dashboard simples */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">RECEITAS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">DESPESAS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-gray-500">(apenas despesas não pagas)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">A RECEBER</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalReceivable)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">SALDO</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-gray-500">Receitas - Despesas pagas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setSelectedTab}>
        <TabsList className="mb-4 flex flex-wrap w-full">
          <TabsTrigger value="all" className="flex-1 min-w-[60px] text-xs sm:text-sm">Todos</TabsTrigger>
          <TabsTrigger value="RECEITA" className="flex-1 min-w-[60px] text-xs sm:text-sm">Receitas</TabsTrigger>
          <TabsTrigger value="DESPESA" className="flex-1 min-w-[60px] text-xs sm:text-sm">Despesas</TabsTrigger>
          <TabsTrigger value="FIXO" className="flex-1 min-w-[60px] text-xs sm:text-sm">Fixos</TabsTrigger>
          <TabsTrigger value="A RECEBER" className="flex-1 min-w-[60px] text-xs sm:text-sm">A Receber</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-0">
          <Accordion type="single" collapsible defaultValue="records">
            <AccordionItem value="records">
              <AccordionTrigger className="font-bold">
                Lista de Registros
                {filteredRecords.length > 0 && (
                  <span className="text-xs ml-2 bg-gray-100 px-2 py-1 rounded-full">
                    {filteredRecords.length}
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            Nenhum registro financeiro encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRecords.map((record) => (
                          <TableRow key={record.id} className={record.archived ? 'bg-gray-50' : ''}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col md:flex-row md:items-center">
                                <div className="text-base md:text-lg">
                                  {record.description}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1 md:mt-0 md:ml-2">
                                  <Badge
                                    variant="outline"
                                    className={
                                      record.category === 'RECEITA' ? 'bg-green-50 text-green-600 border-green-200' :
                                        record.category === 'DESPESA' ? 'bg-red-50 text-red-600 border-red-200' :
                                          record.category === 'FIXO' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                            'bg-yellow-50 text-yellow-600 border-yellow-200'
                                    }
                                  >
                                    {record.category}
                                  </Badge>
                                </div>
                                <div className="md:hidden mt-1">
                                  <div className="text-sm font-medium">
                                    {formatCurrency(record.amount)} • {format(new Date(record.date), 'dd/MM/yyyy')}
                                  </div>
                                  <div className="flex items-center mt-1">
                                    <Badge
                                      variant={record.paid ? "default" : "outline"}
                                      className="text-xs mr-2"
                                    >
                                      {record.paid ? "Pago" : "Não pago"}
                                    </Badge>
                                    {record.archived && <Badge variant="secondary" className="text-xs">Arquivado</Badge>}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {format(new Date(record.date), 'dd/MM/yyyy', {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{formatCurrency(record.amount)}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                variant={record.paid ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => handleTogglePaid(record.id)}
                              >
                                {record.paid ? "Pago" : "Não pago"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex space-x-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleTogglePaid(record.id)}
                                  disabled={record.archived || (record.category === 'RECEITA' && record.paid)}
                                  title={
                                    record.archived ? "Não é possível alterar status de arquivados" :
                                      (record.category === 'RECEITA' && record.paid) ? "Receitas não podem ser desmarcadas como pagas" :
                                        record.paid ? "Marcar como não pago" : "Marcar como pago"
                                  }
                                >
                                  {record.paid ? <Banknote className="h-4 w-4 text-green-500" /> : <CircleDashed className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRecord(record)}
                                  disabled={record.archived}
                                >
                                  <Pencil size={14} />
                                </Button>
                                {record.archived ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-500 hover:text-blue-700"
                                    onClick={() => handleRestoreRecord(record.id)}
                                  >
                                    <RefreshCcw size={14} />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-orange-500 hover:text-orange-700"
                                    onClick={() => handleArchiveRecord(record.id)}
                                  >
                                    <Archive size={14} />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteRecord(record.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar/editar registro */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRecord?.id.startsWith('finance-') && !records.some(r => r.id === editingRecord?.id)
                ? 'Novo Registro Financeiro'
                : 'Editar Registro Financeiro'
              }
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes do registro financeiro abaixo.
            </DialogDescription>
          </DialogHeader>

          {editingRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoria*
                </Label>
                <Select
                  value={editingRecord.category}
                  onValueChange={(value: any) => {
                    // Alterar categoria e atualizar status de pagamento conforme regras
                    const newPaid = value === 'RECEITA' ? true :
                      (value === 'A RECEBER' ? false : editingRecord.paid);

                    setEditingRecord({
                      ...editingRecord,
                      category: value,
                      paid: newPaid
                    });

                    if (value === 'RECEITA') {
                      toast.info('Receitas são automaticamente marcadas como pagas');
                    } else if (value === 'A RECEBER') {
                      toast.info('Itens "A RECEBER" são automaticamente marcados como não pagos');
                    }
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEITA">RECEITA</SelectItem>
                    <SelectItem value="DESPESA">DESPESA</SelectItem>
                    <SelectItem value="FIXO">FIXO</SelectItem>
                    <SelectItem value="A RECEBER">A RECEBER</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição*
                </Label>
                <Input
                  id="description"
                  value={editingRecord.description}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      description: e.target.value
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Valor*
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingRecord.amount}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      amount: parseFloat(e.target.value) || 0
                    })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Data*
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={editingRecord.date}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      date: e.target.value
                    })
                  }
                  className="col-span-3"
                />
              </div>

              {(editingRecord.category === 'DESPESA' || editingRecord.category === 'FIXO' || editingRecord.category === 'A RECEBER') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">
                    Vencimento
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={editingRecord.dueDate || ''}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        dueDate: e.target.value
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paid" className="text-right">
                  Status
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="paid"
                    checked={editingRecord.paid}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        paid: e.target.checked
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="paid" className="text-sm font-normal">
                    {editingRecord.category === 'RECEITA' || editingRecord.category === 'A RECEBER'
                      ? 'Recebido'
                      : 'Pago'
                    }
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Observações
                </Label>
                <Textarea
                  id="notes"
                  value={editingRecord.notes || ''}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      notes: e.target.value
                    })
                  }
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRecord} className="bg-blue-600 hover:bg-blue-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialManagement; 