import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  Send, 
  Lock, 
  AlertTriangle, 
  User as UserIcon, 
  BookOpen, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdSenseInfoPagesProps {
  initialPage: 'privacy' | 'terms' | 'contact';
  onClose: () => void;
}

export default function AdSenseInfoPages({ initialPage, onClose }: AdSenseInfoPagesProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'contact'>(initialPage);

  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Sync tab if initialPage changes
  useEffect(() => {
    setActiveTab(initialPage);
  }, [initialPage]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setFormError('Por favor, preencha todos os campos do formulário.');
      return;
    }

    // Basic email pattern validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Por favor, insira um endereço de e-mail válido.');
      return;
    }

    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0a0d14] flex flex-col h-full overflow-hidden">
      {/* Premium Top Navbar */}
      <div className="px-5 py-4 bg-[#0c0f14] border-b border-slate-900 flex items-center justify-between shrink-0">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">Voltar</span>
        </button>

        <span className="font-display font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] to-amber-400 select-none">
          Sheik Coin Legal
        </span>

        <div className="w-14" /> {/* Spacer */}
      </div>

      {/* Tabs Selection Bar */}
      <div className="bg-[#0b0e16] px-4 py-2 border-b border-slate-900/60 flex gap-1.5 shrink-0 select-none overflow-x-auto no-scrollbar">
        <button
          onClick={() => { setActiveTab('privacy'); setSubmitSuccess(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'privacy' 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Privacidade</span>
        </button>

        <button
          onClick={() => { setActiveTab('terms'); setSubmitSuccess(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'terms' 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Termos de Uso</span>
        </button>

        <button
          onClick={() => { setActiveTab('contact'); setSubmitSuccess(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'contact' 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contato</span>
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 pb-12 bg-[#0a0d14] space-y-6 text-slate-300 no-scrollbar">
        
        {/* PRIVACY POLICY TAB */}
        {activeTab === 'privacy' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2.5 text-white">
              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-base font-extrabold tracking-tight">Política de Privacidade</h1>
                <p className="text-[10px] text-slate-500 font-mono">Última atualização: Julho de 2026</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              No <span className="text-white font-bold">Sheik Coin</span>, a privacidade dos nossos usuários é de extrema importância para nós. Esta política de privacidade descreve em detalhes quais tipos de informações são coletadas e armazenadas, bem como a forma como as utilizamos e as protegemos.
            </p>

            <div className="h-px bg-slate-900" />

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>1. Uso do AdsTerra Social Bar</span>
              </h2>
              <p className="text-xs leading-relaxed text-slate-400">
                Nós utilizamos a rede oficial de publicidade <span className="text-white font-semibold">AdsTerra Social Bar</span> para exibir anúncios aos nossos usuários enquanto utilizam a plataforma. 
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
                A AdsTerra utiliza tecnologias avançadas para selecionar e exibir anúncios relevantes com base no contexto de navegação. Estes anúncios são fornecidos diretamente pelos servidores da AdsTerra de forma transparente e segura.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>2. Cookies e Identificadores</span>
              </h2>
              <p className="text-xs leading-relaxed text-slate-400">
                A AdsTerra, como fornecedora parceira, utiliza cookies e identificadores de navegador para veicular anúncios apropriados no site Sheik Coin. O uso dessas ferramentas permite otimizar a experiência do usuário e veicular anúncios apropriados aos nossos visitantes.
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
                Os usuários podem optar por gerenciar e desativar cookies personalizados ajustando as preferências de privacidade diretamente no próprio navegador de internet.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>3. Proteção e Segurança dos Dados</span>
              </h2>
              <p className="text-xs leading-relaxed text-slate-400">
                Garantimos que todas as informações de login e estatísticas dos usuários são protegidas utilizando canais de criptografia seguros e servidores protegidos no Firestore. 
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
                As informações coletadas são exclusivamente utilizadas para o funcionamento correto das contas de recompensas e a entrega segura dos diamantes comprados. Nós <span className="text-white font-semibold">nunca vendemos, alugamos ou comercializamos</span> dados pessoais de nossos membros para terceiros sob nenhuma circunstância.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>4. Seus Direitos e Consentimento</span>
              </h2>
              <p className="text-xs leading-relaxed text-slate-400">
                Ao utilizar nosso site e participar das nossas recompensas por visualização de publicidade, você concorda formalmente com a nossa Política de Privacidade e aceita os seus respectivos termos de coleta de dados de personalização de anúncios.
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
                Caso você possua qualquer dúvida, queira requisitar a exclusão definitiva de seus dados de nossa base ou queira esclarecer algum ponto desta Política, entre em contato diretamente conosco pelo canal de suporte oficial.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3 mt-4">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Ambiente Seguro e Confiável</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Este documento segue estritamente as diretrizes da LGPD (Lei Geral de Proteção de Dados) e as políticas de conformidade do programa AdsTerra.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TERMS OF USE TAB */}
        {activeTab === 'terms' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2.5 text-white">
              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-base font-extrabold tracking-tight">Termos de Uso</h1>
                <p className="text-[10px] text-slate-500 font-mono">Última atualização: Julho de 2026</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              Bem-vindo ao <span className="text-white font-bold">Sheik Coin</span>. Ao acessar, registrar-se ou interagir com nosso aplicativo de recompensas, você declara concordar integralmente e estar legalmente vinculado a estes Termos de Uso.
            </p>

            <div className="h-px bg-slate-900" />

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>1. Aceitação dos Termos</span>
              </h2>
              <p className="text-xs leading-relaxed text-slate-400">
                O uso deste site implica na aceitação automática e incondicional de todos os termos aqui descritos. Se você não concordar com qualquer termo ou diretriz descrita neste documento, solicitamos que não continue a usar nossa plataforma.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>2. Utilização Legal da Plataforma</span>
              </h2>
              <p className="text-xs leading-relaxed text-slate-400">
                Os usuários devem utilizar a plataforma Sheik Coin estritamente de forma pessoal, recreativa e em total conformidade com a legislação local. O sistema funciona como um hub de visualização de conteúdo publicitário (via AdsTerra) com trocas de saldo em Coins virtuais por itens cosméticos digitais e diamantes Free Fire.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-l-2 border-red-500/40 pl-3">
                <span>3. Tolerância Zero a Fraudes e Manipulação</span>
              </h2>
              <p className="text-xs leading-relaxed text-slate-400">
                Para garantir a integridade do ecossistema e a qualidade do tráfego enviado aos nossos anunciantes parceiros da AdsTerra, a utilização de métodos automatizados é expressamente proibida.
              </p>
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1.5">
                <p className="text-[11px] text-red-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Ações Estritamente Proibidas:</span>
                </p>
                <ul className="text-[10px] text-slate-400 list-disc list-inside space-y-1 leading-normal pl-1">
                  <li>Uso de robôs (bots), macros, scripts automatizados ou auto-clique.</li>
                  <li>Injeção ou simulação de requisições de recompensa sem interação humana.</li>
                  <li>Uso de proxies, VPNs ou emuladores para fraudar a exibição de anúncios.</li>
                  <li>Criação de múltiplas contas falsas para acumular saldo de forma ilegal.</li>
                </ul>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Qualquer tentativa comprovada de fraudar, manipular ou violar o funcionamento correto das recompensas resultará no <span className="text-red-400 font-bold">bloqueio imediato e definitivo</span> da conta, com perda irreversível do saldo de moedas acumulado, além de potenciais medidas cabíveis.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>4. Modificações e Alterações do Serviço</span>
              </h2>
              <p className="text-xs leading-relaxed text-slate-400">
                O Sheik Coin reserva-se o direito de, a qualquer momento e sem aviso prévio, alterar as regras de recompensa, a proporção de conversão de moedas (Coins), os pacotes de diamantes disponíveis na Lojinha, ou suspender temporariamente recursos do site para manutenção técnica ou adequações legais perante a AdsTerra.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>5. Limitação de Responsabilidade</span>
              </h2>
              <p className="text-xs leading-relaxed text-slate-400">
                O Sheik Coin não é afiliado, patrocinado ou endossado oficialmente pela desenvolvedora Garena ou pela marca Free Fire. Trata-se de uma plataforma independente que adquire diamantes e recargas de canais oficiais e terceirizados para distribuição aos usuários vencedores.
              </p>
            </div>
          </motion.div>
        )}

        {/* CONTACT FORM TAB */}
        {activeTab === 'contact' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2.5 text-white">
              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-base font-extrabold tracking-tight">Fale Conosco</h1>
                <p className="text-[10px] text-slate-500 font-mono">Dúvidas, sugestões, suporte de compras ou parcerias</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              Tem alguma dúvida sobre suas moedas ou sobre o envio dos diamantes Free Fire? Quer nos enviar uma sugestão? Preencha o formulário profissional abaixo e nossa equipe responderá em até 24 horas úteis.
            </p>

            <div className="h-px bg-slate-900" />

            <AnimatePresence mode="wait">
              {submitSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3.5 my-4"
                >
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Mensagem Enviada!</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Agradecemos o contato. Sua mensagem foi protocolada com sucesso e enviada ao suporte do Sheik Coin. Verifique sua caixa de e-mail em breve.
                    </p>
                  </div>
                  <button 
                    onClick={() => setSubmitSuccess(false)}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-[11px] font-bold text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                  >
                    Enviar nova mensagem
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  onSubmit={handleContactSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {formError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-slate-500" />
                      <span>Seu Nome Completo</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: João Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#121622] border border-slate-850 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs font-medium text-white focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>E-mail para Retorno</span>
                    </label>
                    <input 
                      type="email" 
                      placeholder="Ex: joao@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#121622] border border-slate-850 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs font-medium text-white focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Subject Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-500" />
                      <span>Assunto da Mensagem</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: Dúvida sobre resgate, Parceria, etc."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#121622] border border-slate-850 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs font-medium text-white focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-slate-500" />
                      <span>Mensagem detalhada</span>
                    </label>
                    <textarea 
                      placeholder="Escreva sua mensagem aqui..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full bg-[#121622] border border-slate-850 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white focus:outline-none transition-all placeholder:text-slate-600 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Processando envio...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Mensagem</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="p-4 rounded-2xl bg-[#121622] border border-slate-850 flex flex-col gap-1 mt-4">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">E-mail Corporativo Direto</span>
              <p className="text-xs font-bold text-amber-400 font-mono">contato@sheikcoin.site</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Para assuntos de parcerias com mídias ou questões de auditoria do AdsTerra, envie um e-mail diretamente.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
