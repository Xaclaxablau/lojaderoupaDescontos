import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import phpserver from '@/lib/phpserver';
// Definir a interface do contexto de autenticação
interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  userId: string | null;
}

// Criar o contexto com um valor padrão
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
// Deve ser uma função nomeada para compatibilidade com o Fast Refresh
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Definir as props do provedor
interface AuthProviderProps {
  children: ReactNode;
}

// Função para gerar um userId anônimo
const getAnonymousUserId = (): string => {
  let userId = localStorage.getItem('anonymous_user_id');

  if (!userId) {
    userId = `anon_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('anonymous_user_id', userId);
  }

  return userId;
};

// Componente provedor
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(() => {
    // Verificar se há um ID de usuário no localStorage ou usar anônimo
    const savedUserId = localStorage.getItem('user_id');
    if (!savedUserId) {
      const anonymousId = getAnonymousUserId();
      localStorage.setItem('user_id', anonymousId);
      return anonymousId;
    }
    return savedUserId;
  });
  const navigate = useNavigate();

  // Verificar se já existe um usuário autenticado no localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Verificar se o usuário é admin
      if (parsedUser.email === 'admin@exemplo.com' || parsedUser.email === 'marcos.rherculano@gmail.com') {
        setIsAdmin(true);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Validação simplificada - em produção isto seria feito no backend
      var user = await phpserver().login(email, password);
      console.log(user);
      if (user && user.id) {
        const mockUser = {
          id: user.id,
          email,
          role: 'admin'
        };

        // Salvar no localStorage
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        localStorage.setItem('auth_token', 'mock-token-' + Date.now());

        setUser(mockUser);
        setIsAdmin(true);

        return {};
      }
      /* if ((email === 'admin@exemplo.com' && password === 'senha123') ||
         (email === 'marcos.rherculano@gmail.com' && password === 'markinhos123')) {
       
       }*/

      // Se as credenciais não forem válidas
      toast.error('Email ou senha inválidos');
      return { error: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Erro de login:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Remover do localStorage
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');

      setUser(null);
      setIsAdmin(false);
      navigate('/login');
      return;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAdmin,
        userId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 