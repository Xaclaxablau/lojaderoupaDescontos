import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getStoreSettings } from '@/lib/localStorage';

const PrivacyPolicyPage = () => {
  const [policy, setPolicy] = useState('');

  useEffect(() => {
    const settings = getStoreSettings();
    setPolicy(settings.privacyPolicy || 'Nenhuma política de privacidade cadastrada.');
  }, []);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Política de Privacidade</h1>
        <div className="prose max-w-none whitespace-pre-line">{policy}</div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage; 