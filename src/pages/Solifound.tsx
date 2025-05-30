import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Users, Shield, Zap } from 'lucide-react';
import Button from '../assets/modernbutton';
import Card from '../assets/solicards';
import WhyCard1 from '../assets/whycard1';
import WhyCard2 from '../assets/whycard2';
import WhyCard3 from '../assets/whycard3';

const Solifound: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <p className="text-lg md:text-xl opacity-90 mb-8">
                La plataforma que redefine la forma en que las personas colaboran y resuelven problemas juntos.
              </p>
              <Button />
            </div>
            <div className="hidden md:flex justify-center items-center scale-in">
              <Card />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por qué elegir Solifound?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Nuestra plataforma ofrece todo lo que necesitas para conectar, colaborar y crear soluciones innovadoras.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <WhyCard1 />
            <WhyCard2 />
            <WhyCard3 />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Solifound;