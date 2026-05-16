import { get } from "http";
import { syncProducts } from "./productHelper";
import { getStoreSettings } from "./supabase";

const servidor = 'http://app.adampresentes.com.br';
// const servidor = 'http://localhost:8000';

type RequestPayload = Record<string, any>;

async function request(endpoint: string, data: RequestPayload, method: 'POST' | 'GET' = 'POST') {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (method === 'POST') {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${servidor}/${endpoint}`, options);
    if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
    }
    return response.json();
}

function phpserver() {
    return {
        login: (email: string, password: string) => request('login.php', { email, password }),
        register: (name: string, email: string, password: string) =>
            request('register.php', { name, email, password }),
        getProducts: () => request('getProducts.php', {}),
        updateProducts: (product: any) => request('updateProducts.php', product),
        logout: (token: string) =>
            request('logout.php', { token }),
        syncProducts: async () => {
            var products = await request('getProducts.php', {});
            localStorage.setItem('products', JSON.stringify(products));
        },
        getStoreSettings: () => request('getSettings.php', {}),
        updateStoreSettings: (settings: any) => request('updateSettings.php', settings),
        getIframe: () => request('getIframe.php', {}),
        updateIframe: (iframe: any) => request('updateIframe.php', iframe),
        deleteIframe: () => request('deleteIframe.php', {}),
        getFinanceiro: () => request('getFinanceiro.php', {}),
        updateFinanceiro: (financeiro: any) => request('updateFinanceiro.php', financeiro),
        deleteFinanceiro: () => request('deleteFinanceiro.php', {}),
        getClientes: () => request('getClientes.php', {}),
        updateClientes: (clientes: any) => request('updateClientes.php', clientes),
        syncSettings: async () => {
            var settings = await request('getSettings.php', {});
            localStorage.setItem('storeSettings', JSON.stringify(settings));
            localStorage.setItem('store_settings', JSON.stringify(settings));
        },
        servidor: servidor
        // Adicione mais funções conforme necessário...
    };
}

export default phpserver;