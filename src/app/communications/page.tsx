'use client';

import { useState } from 'react';
import { MessageSquare, Copy, Send, FileText, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getMenusByDate } from '@/lib/actions/nutrition';

function getWeekDates() {
  const curr = new Date();
  const day = curr.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const first = new Date(curr);
  first.setDate(curr.getDate() + diff);

  const dates = [];
  for (let i = 0; i < 5; i++) {
    const next = new Date(first.getTime());
    next.setDate(first.getDate() + i);
    dates.push(next);
  }
  return dates;
}

const TEMPLATES = [
  {
    id: 'meeting',
    name: 'Reunión de Padres',
    icon: '📅',
    content: 'Estimados padres de familia,\n\nLes recordamos que el día [FECHA] a las [HORA] tendremos nuestra reunión general en las instalaciones de Nova Skill Kids.\n\nTemas a tratar:\n- [TEMA 1]\n- [TEMA 2]\n\nEsperamos contar con su puntual asistencia.\n\nAtentamente,\nDirección - Nova Skill Kids'
  },
  {
    id: 'payment',
    name: 'Recordatorio de Pago',
    icon: '💰',
    content: 'Estimados padres de familia,\n\nEste es un recordatorio amistoso de que el pago correspondiente a la mensualidad de [MES] vence el día [FECHA].\n\nPor favor, asegúrense de realizar el pago a tiempo para evitar recargos.\n\nGracias por su colaboración.'
  },
  {
    id: 'holiday',
    name: 'Aviso de Asueto',
    icon: '🏖️',
    content: 'Aviso Importante:\n\nEstimados padres, les informamos que el día [FECHA] Nova Skill Kids permanecerá cerrada con motivo de [MOTIVO].\n\nReanudaremos nuestras actividades normales el día [FECHA REANUDACIÓN].\n\n¡Que tengan un excelente día!'
  },
  {
    id: 'menu_day',
    name: 'Menú del Día',
    icon: '🍎',
    content: 'Generando menú...'
  },
  {
    id: 'menu_week',
    name: 'Menú de la Semana',
    icon: '🍲',
    content: 'Generando menú...'
  },
  {
    id: 'event',
    name: 'Evento Especial',
    icon: '🎈',
    content: '¡Hola a todos!\n\nEl próximo [FECHA] celebraremos [NOMBRE DEL EVENTO] en Nova Skill Kids.\n\nLos niños pueden venir vestidos de [CÓDIGO DE VESTIMENTA].\nPor favor enviar a los niños con: [MATERIALES/REQUISITOS].\n\n¡Será un día muy divertido!'
  },
  {
    id: 'blank',
    name: 'Mensaje en Blanco',
    icon: '📝',
    content: ''
  }
];

export default function CommunicationsPage() {
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (templateId === 'menu_day') {
      setIsLoading(true);
      setMessage('Obteniendo menú del día...');
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const menus = await getMenusByDate(todayStr);
        let text = `🍎 *Menú del Día (${new Intl.DateTimeFormat('es-MX', { dateStyle: 'long'}).format(new Date())})* 🍎\n\n`;
        if (menus.length === 0) {
          text += 'Aún no hay menú registrado para hoy.';
        } else {
          menus.forEach((m: any) => {
            text += `*${m.mealType.toUpperCase()}*\n`;
            text += `🍲 ${m.description}\n\n`;
          });
          text += `¡Buen provecho!`;
        }
        setMessage(text);
      } catch(e) {
        setMessage('Error al obtener el menú.');
      }
      setIsLoading(false);
      return;
    }

    if (templateId === 'menu_week') {
      setIsLoading(true);
      setMessage('Obteniendo menú de la semana...');
      try {
        const dates = getWeekDates();
        let text = `📅 *Menú Semanal Nova Skill Kids* 📅\n`;
        text += `Del ${new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long'}).format(dates[0])} al ${new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long'}).format(dates[4])}\n\n`;

        for (const d of dates) {
          const dateStr = d.toISOString().split('T')[0];
          const menus = await getMenusByDate(dateStr);
          const dayName = new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(d);
          
          text += `*${dayName.toUpperCase()} ${d.getDate()}*\n`;
          if (menus.length === 0) {
            text += `_Sin registro_\n\n`;
          } else {
            menus.forEach((m: any) => {
              text += `• ${m.mealType}: ${m.description}\n`;
            });
            text += `\n`;
          }
        }
        setMessage(text);
      } catch(e) {
        setMessage('Error al obtener el menú.');
      }
      setIsLoading(false);
      return;
    }

    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setMessage(template.content);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message);
    // This URL opens WhatsApp Web or the app and lets the user pick a contact/group
    window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
          <MessageSquare className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Comunicaciones</h1>
          <p className="text-slate-500 mt-0.5">Redacta y envía mensajes por WhatsApp a tus grupos de padres.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Templates */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-slate-400" />
            Plantillas Rápidas
          </h2>
          
          <div className="space-y-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  selectedTemplate === template.id
                    ? 'border-green-500 bg-green-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-green-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl">{template.icon}</span>
                <span className={`font-bold ${selectedTemplate === template.id ? 'text-green-800' : 'text-slate-700'}`}>
                  {template.name}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <div className="flex gap-2">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900">¿Cómo funciona?</p>
                <p className="text-xs text-blue-700 mt-1">
                  1. Escribe o elige un mensaje.<br/>
                  2. Haz clic en "Enviar por WhatsApp".<br/>
                  3. Se abrirá WhatsApp y podrás seleccionar tu grupo de padres.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <h2 className="font-bold text-slate-700">Mensaje a enviar</h2>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="flex-1 w-full border-2 border-slate-200 rounded-xl p-4 focus:border-green-500 focus:ring-0 outline-none resize-none transition-colors"
              />
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-6 flex items-center justify-between gap-4">
              <button
                onClick={handleCopy}
                disabled={!message.trim()}
                className="px-6 py-3 rounded-xl font-bold border-2 border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                {copied ? '¡Copiado!' : 'Copiar Texto'}
              </button>

              <button
                onClick={handleWhatsApp}
                disabled={!message.trim()}
                className="px-8 py-3 rounded-xl font-bold bg-[#25D366] text-white hover:bg-[#128C7E] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 hover:-translate-y-0.5"
              >
                <Send className="h-5 w-5" />
                Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
