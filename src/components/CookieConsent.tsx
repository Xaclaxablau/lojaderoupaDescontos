import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-black bg-opacity-90 text-white p-4 flex flex-col md:flex-row items-center justify-between gap-2 shadow-lg">
      <span className="text-sm">Este site utiliza cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa <a href="/politica-de-privacidade" className="underline">Política de Privacidade</a>.</span>
      <button onClick={acceptCookies} className="mt-2 md:mt-0 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm font-semibold">Aceitar</button>
    </div>
  );
};

export default CookieConsent; 