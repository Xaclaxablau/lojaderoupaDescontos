import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Share2, Plus, Search, Edit2, Trash2, X, Star } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useToast } from '@/components/ui/use-toast';
import phpserver from '@/lib/phpserver';
import { get } from 'http';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  rating?: number;
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    id: '',
    name: '',
    phone: '',
    email: '',
    rating: 0
  });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [searchRating, setSearchRating] = useState<string>('all');
  const { toast } = useToast();
  const [carregando, setCarregando] = useState(true);
  const [oldCustomers, setOldCustomers] = useState(customers);
  // Carregar clientes do localStorage
  useEffect(() => {
    async function syncCustomers() {
      try {
        const customers = await phpserver().getClientes();
        localStorage.setItem('customers', JSON.stringify(customers));
        setCustomers(customers);
        setCarregando(false);
      } catch (e) {
        console.error('Falha ao carregar clientes', e);
        setCustomers([]);
      }
    }
    syncCustomers();
  }, []);

  // Salvar clientes no localStorage
  useEffect(() => {
    async function saveCustomers(customers) {
      if (carregando) return;
      await phpserver().updateClientes(customers);
      localStorage.setItem('customers', JSON.stringify(customers));
    }

    saveCustomers(customers);
  }, [customers]);

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }

    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      phone: newCustomer.phone.replace(/\D/g, ''),
      email: newCustomer.email || undefined,
      rating: newCustomer.rating || 0
    };

    setCustomers(prev => [...prev, customer].sort((a, b) => a.name.localeCompare(b.name)));
    setNewCustomer({ id: '', name: '', phone: '', email: '', rating: 0 });
    toast.success('Cliente adicionado com sucesso');
  };

  const handleShare = (customer: Customer) => {
    if (!shareMessage) {
      toast.error('Por favor, insira uma mensagem para compartilhar');
      return;
    }

    const message = `Olá ${customer.name}, tudo bem? ${shareMessage}${shareLink ? ' ' + shareLink : ''}`;
    const whatsappUrl = `https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setNewCustomer(customer);
    setEditModalOpen(true);
  };

  const handleUpdateCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }

    setCustomers(prev =>
      prev.map(customer =>
        customer.id === editingCustomer?.id
          ? { ...newCustomer, phone: newCustomer.phone.replace(/\D/g, '') }
          : customer
      ).sort((a, b) => a.name.localeCompare(b.name))
    );

    setEditingCustomer(null);
    setNewCustomer({ id: '', name: '', phone: '', email: '', rating: 0 });
    setEditModalOpen(false);
    toast.success('Cliente atualizado com sucesso');
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      setCustomers(prev => prev.filter(customer => customer.id !== customerToDelete.id));
      setCustomerToDelete(null);
      setDeleteDialogOpen(false);
      toast.success('Cliente excluído com sucesso');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm
      ? customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    const matchesRating = ratingFilter === 'all'
      ? true
      : customer.rating === parseInt(ratingFilter);

    const matchesSearchRating = searchRating === 'all'
      ? true
      : customer.rating === parseInt(searchRating);

    return matchesSearch && matchesRating && matchesSearchRating;
  });

  const renderStars = (rating: number = 0, isEditable: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={isEditable ? "button" : "button"}
            onClick={() => isEditable && onChange && onChange(star)}
            className={`${isEditable ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
            />
          </button>
        ))}
      </div>
    );
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
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome*</Label>
            <Input
              id="name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              placeholder="Nome do cliente"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone*</Label>
            <Input
              id="phone"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Classificação</Label>
            {renderStars(newCustomer.rating, true, (rating) =>
              setNewCustomer({ ...newCustomer, rating })
            )}
          </div>
        </div>
        <Button onClick={handleAddCustomer} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Cliente
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar Clientes</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, telefone ou email"
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex-1">
            <Label>Buscar por Classificação</Label>
            <Select value={searchRating} onValueChange={setSearchRating}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as classificações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as classificações</SelectItem>
                <SelectItem value="5">5 estrelas</SelectItem>
                <SelectItem value="4">4 estrelas</SelectItem>
                <SelectItem value="3">3 estrelas</SelectItem>
                <SelectItem value="2">2 estrelas</SelectItem>
                <SelectItem value="1">1 estrela</SelectItem>
                <SelectItem value="0">Sem classificação</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Filtrar por Classificação</Label>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as classificações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as classificações</SelectItem>
                <SelectItem value="5">5 estrelas</SelectItem>
                <SelectItem value="4">4 estrelas</SelectItem>
                <SelectItem value="3">3 estrelas</SelectItem>
                <SelectItem value="2">2 estrelas</SelectItem>
                <SelectItem value="1">1 estrela</SelectItem>
                <SelectItem value="0">Sem classificação</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="shareMessage">Mensagem para Compartilhar</Label>
            <Input
              id="shareMessage"
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              placeholder="Digite a mensagem que será compartilhada"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="shareLink">Link para Compartilhar (opcional)</Label>
            <Input
              id="shareLink"
              value={shareLink}
              onChange={(e) => setShareLink(e.target.value)}
              placeholder="https://exemplo.com"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classificação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className={`flex flex-col md:table-row ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium relative">
                    {customer.name}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCustomer(customer)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCustomer(customer)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`https://wa.me/${customer.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 flex items-center gap-1"
                    >
                      <FaWhatsapp />
                      {customer.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap md:table-cell">
                    {customer.email ? (
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        {customer.email}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStars(customer.rating)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap md:table-cell">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(customer)}
                      className="flex items-center gap-1 w-full md:w-auto justify-center"
                    >
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nome*
              </Label>
              <Input
                id="edit-name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Telefone*
              </Label>
              <Input
                id="edit-phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                E-mail
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Classificação</Label>
              <div className="col-span-3">
                {renderStars(newCustomer.rating, true, (rating) =>
                  setNewCustomer({ ...newCustomer, rating })
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateCustomer}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente {customerToDelete?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerManagement; 