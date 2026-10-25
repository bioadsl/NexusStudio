# 📅 Agendou.io - Gerenciador de Agendamentos Automatizado (Micro-SaaS MVP)

Sistema completo de agendamento online inteligente voltado para **Barbearias, Salões de Beleza, Clínicas de Estética, Consultórios Odontológicos e Clínicas de Fisioterapia**.

Desenvolvido segundo a metodologia **Antigravity** (código modular, hiper-funcional, sem dependências de compilação ou frameworks pesados, pronto para hospedar diretamente no **GitHub Pages**).

---

## 🚀 Demonstração Rápida & Estrutura

- **Painel do Cliente**:
  - ✂️ **Seleção de Serviços**: Cards dinâmicos com duração, preço em BRL e descrição detalhada.
  - 🗓️ **Calendário Interativo**: Navegação mensal com bloqueio de dias passados e folgas semanais.
  - ⏰ **Slots Dinâmicos**: Geração de horários inteligentes com intervalo configurável (ex: 45 min) e bloqueio automático do horário de almoço e de horários passados no dia atual.
  - 🛡️ **Código Blindado contra Conflitos**: Impedimento estrito de agendamento em datas passadas ou choque de horário duplicado.
  - 📋 **Formulário com Máscara**: Validação de WhatsApp brasileiro `(99) 99999-9999` e e-mail.
  - 🎟️ **Ticket / Voucher Digital**: Geração de comprovante estilo cartão de embarque com código único `#AGD-XXXX`.
  - 💬 **Automação WhatsApp**: Link direto com mensagem pré-formatada para o cliente confirmar o agendamento com o estabelecimento em 1 clique.
  - 📆 **Integração Google Agenda**: Botão para adicionar o compromisso diretamente na agenda do cliente.

- **Painel do Administrador (Gestão do Estabelecimento)**:
  - 📊 **Métricas / KPIs em Tempo Real**: Total de agendamentos, confirmados, pendentes, atendimentos do dia e faturamento estimado.
  - 🔍 **Busca & Filtros**: Filtros por status (*Todos, Pendentes, Confirmados, Concluídos, Cancelados*) e filtro por período (*Hoje, Amanhã, Próximos 7 dias*).
  - ⚡ **Ações Rápidas**: Confirmar, Cancelar (libera o horário automaticamente), Remarcar horário e Excluir.
  - 📲 **Contato Direto**: Botão para o administrador chamar o cliente no WhatsApp com mensagem de lembrete personalizada.
  - ⚙️ **Configurações**: Ajuste de horários de abertura e fechamento, duração do slot, intervalo de almoço e cadastro de novos serviços.
  - 🔄 **Seletor de Nicho Demo**: Alterne instantaneamente entre Barbearia, Salão de Beleza, Estética, Odonto e Fisioterapia durante reuniões de vendas!

---

## 📁 Estrutura de Arquivos & Funil Comercial

```text
/
├── index.html           # Landing Page Comercial Principal & Tabela de Níveis (NexusStudio)
├── degustacao.html      # Degustação Funcional Interativa (Agendou.io - Cliente & Admin)
├── css/
│   └── styles.css       # Estilos complementares, micro-animações e temas
├── js/
│   ├── store.js         # Engine de regras de negócio, LocalStorage e validações
│   └── app.js           # Controlador da interface, calendário e automações
├── .gitignore           # Ignora arquivos temporários e do sistema
└── README.md            # Guia de implantação e uso
```

---

## 🌐 Como Hospedar no GitHub Pages (Passo a Passo)

1. Crie um repositório no seu GitHub (ex: `agendou-app` ou `agendamentos`).
2. No seu terminal, dentro desta pasta:
   ```bash
   git remote set-url origin https://github.com/bioadsl/NexusStudio.git
   git push -u origin main
   ```
3. Acesse o repositório no GitHub:
   - Vá em **Settings** > **Pages** (no menu lateral esquerdo).
   - Em **Branch**, selecione `main` e a pasta `/ (root)`.
   - Clique em **Save**.
4. Em cerca de 1 minuto, seu sistema estará disponível publicamente no link:
   `https://bioadsl.github.io/NexusStudio/`

---

## 🔧 Personalização Rápida

- **WhatsApp de recebimento configurado**:
  - O número padrão agora está definido como `(61) 98426-0515` (`5561984260515`).
  - Você também pode alterá-lo a qualquer momento em **Gestão / Admin** > **Configurar Horários & Serviços** ou nos presets do arquivo [`js/store.js`](file:///c:/laragon/www/devpages/js/store.js).
