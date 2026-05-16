import { createClient } from '@supabase/supabase-js';

// Usar as mesmas credenciais do .env
const supabaseUrl = 'https://xzvkkbrbwxghhqtncxok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dmtrYnJid3hnaGhxdG5jeG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMjE4MjcsImV4cCI6MjA2MTc5NzgyN30.nOuYr8xRzVGlq6SI_3iG7IRJzitz-0VbX3yvVZ6VLMs';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const createAdminUser = async () => {
  const email = 'marcos.rherculano@gmail.com';
  const password = 'markinhos123';

  console.log(`Tentando criar usuário admin: ${email}`);

  try {
    // Primeiro tentar fazer login para verificar se o usuário já existe
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!loginError) {
      console.log('✅ O usuário já existe e as credenciais são válidas.');
      return;
    }

    // Se não conseguir fazer login, tentar criar o usuário
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
    } else {
      console.log('✅ Usuário criado com sucesso!');
      console.log('Detalhes:', data.user);
    }
  } catch (error) {
    console.error('❌ Erro ao executar a operação:', error);
  }
};

createAdminUser(); 