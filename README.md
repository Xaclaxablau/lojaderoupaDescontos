# Loja de Roupas

Este é um projeto de e-commerce para uma loja de roupas, desenvolvido com React, TypeScript e Vite.

## Tecnologias Utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui

## Como Executar

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

## Funcionalidades

- Catálogo de produtos
- Carrinho de compras
- Sistema de cupons de desconto
- Configurações personalizáveis da loja
- Integração com WhatsApp
- Página "Quem Somos"
- Gerenciamento de categorias
- Configuração de redes sociais

## Estrutura do Projeto

- `/src/components`: Componentes reutilizáveis
- `/src/contexts`: Contextos do React (Auth, Cart, etc)
- `/src/pages`: Páginas da aplicação
- `/src/types`: Definições de tipos TypeScript
- `/src/lib`: Funções utilitárias

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

# Loja de Roupas - Sistema de Categorias

Este guia explica como utilizar o sistema de categorias e destaques de categorias na loja de roupas.

## Gerenciamento de Categorias

### 1. Tipos de Categorias

O sistema suporta três tipos de categorias:

- **Categorias Padrão**: Feminino, Masculino, Kids, Calçados, Acessórios, etc.
- **Links Personalizados**: Categorias adicionadas através do menu "Links do Cabeçalho"
- **Categorias em Destaque**: Categorias exibidas na seção de destaques da página inicial

### 2. Como Adicionar Categorias em Destaque

1. Acesse o **Painel de Administração**
2. Vá para a aba **Configurações**
3. Clique em **Categorias em Destaque**
4. Ative a opção "Exibir categorias em destaque"
5. Clique em **Adicionar Nova Categoria**
6. Preencha o **Nome da Categoria** - o link será gerado automaticamente
7. Adicione uma **Imagem da Categoria** (opcional)
8. Salve as alterações

### 3. Como Adicionar Produtos às Categorias

1. Acesse o **Painel de Administração**
2. Clique em **Adicionar Produto** ou edite um produto existente
3. No campo **Categoria**, você verá todas as categorias disponíveis:
   - Categorias Principais
   - Links Personalizados
   - Categorias em Destaque
4. Selecione a categoria desejada
5. Salve o produto

## Recursos de Categorias

- **Páginas Automáticas**: Cada categoria gera automaticamente uma página em `/products/[categoria]`
- **Normalização**: As categorias são normalizadas automaticamente para evitar duplicações
- **Filtros**: Os produtos podem ser filtrados por categoria em várias páginas
- **Destaques Visuais**: As categorias em destaque aparecem na página inicial

## Solução de Problemas

Se você não conseguir ver um produto em uma categoria específica:

1. Verifique se a categoria foi escrita corretamente
2. Verifique se a categoria está ativada nas configurações
3. Para categorias em destaque, certifique-se de que o link foi gerado corretamente

## Observações Importantes

- **Não modifique manualmente** os links de categorias em destaque - eles são gerados automaticamente
- As categorias em destaque aparecem tanto no menu de seleção do produto quanto na página inicial
- Os produtos podem pertencer a múltiplas categorias, mas sua categoria principal determina onde aparecerão primeiro
