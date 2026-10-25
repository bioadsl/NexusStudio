/**
 * ============================================================================
 * AGENDOU.IO - STORE & BUSINESS LOGIC ENGINE
 * Arquitetura Limpa (Antigravity Clean State Management)
 * ============================================================================
 */

(function (window) {
    'use strict';

    const STORAGE_KEYS = {
        SETTINGS: 'agendou_settings_v1',
        SERVICES: 'agendou_services_v1',
        APPOINTMENTS: 'agendou_appointments_v1',
        NICHE: 'agendou_niche_v1'
    };

    // Presets prontos para demonstração em múltiplos nichos de mercado
    const PRESETS = {
        barbearia: {
            nicheKey: 'barbearia',
            nicheName: 'Barbearia Premium',
            businessName: 'Barbearia Dom Imperador',
            subtitle: 'Tradição, estilo e cuidados masculinos de alto padrão',
            phone: '5561984260515',
            address: 'Av. Paulista, 1200 - Bela Vista, São Paulo - SP',
            icon: 'scissors',
            slotDuration: 45,
            startHour: '09:00',
            endHour: '19:00',
            lunchStart: '12:00',
            lunchEnd: '13:00',
            services: [
                { id: 'srv-1', name: 'Corte Degradê & Lavagem', price: 50.00, duration: 40, description: 'Corte na tesoura ou máquina com lavagem e finalização premium.' },
                { id: 'srv-2', name: 'Barboterapia & Toalha Quente', price: 40.00, duration: 35, description: 'Alinhamento na navalha com toalha quente e hidratação com óleos.' },
                { id: 'srv-3', name: 'Combo Imperial: Cabelo + Barba', price: 80.00, duration: 60, description: 'Experiência completa com finalização VIP e cerveja artesanal inclusa.' },
                { id: 'srv-4', name: 'Camuflagem de Fios Brancos', price: 45.00, duration: 30, description: 'Pigmentação discreta e natural para barba ou cabelo.' }
            ]
        },
        estetica: {
            nicheKey: 'estetica',
            nicheName: 'Clínica de Estética & Spa',
            businessName: 'Lumina Estética Avançada',
            subtitle: 'Realce sua beleza natural com protocolos modernos e seguros',
            phone: '5561984260515',
            address: 'Rua Oscar Freire, 850 - Jardins, São Paulo - SP',
            icon: 'sparkles',
            slotDuration: 50,
            startHour: '08:30',
            endHour: '19:30',
            lunchStart: '12:30',
            lunchEnd: '13:30',
            services: [
                { id: 'srv-1', name: 'Limpeza de Pele Profunda', price: 160.00, duration: 60, description: 'Extração de cravos, vapor de ozônio e máscara de fototerapia LED.' },
                { id: 'srv-2', name: 'Drenagem Linfática Corporal', price: 130.00, duration: 50, description: 'Técnica manual para redução de retenção de líquidos e relaxamento.' },
                { id: 'srv-3', name: 'Peeling de Diamante + Hidratação', price: 180.00, duration: 45, description: 'Esfoliação mecânica profunda para rejuvenescimento e viço imediato.' },
                { id: 'srv-4', name: 'Massagem Relaxante com Pedras Quentes', price: 150.00, duration: 60, description: 'Alívio muscular e bem-estar físico e mental profundo.' }
            ]
        },
        odontologia: {
            nicheKey: 'odontologia',
            nicheName: 'Consultório Odontológico',
            businessName: 'OdontoVitta Saúde & Estética',
            subtitle: 'Excelência em saúde bucal, estética dental e ortodontia',
            phone: '5561984260515',
            address: 'Av. Brigadeiro Faria Lima, 2100 - Itaim Bibi, SP',
            icon: 'smile',
            slotDuration: 45,
            startHour: '08:00',
            endHour: '18:00',
            lunchStart: '12:00',
            lunchEnd: '13:00',
            services: [
                { id: 'srv-1', name: 'Consulta Avaliativa & Check-up', price: 120.00, duration: 40, description: 'Exame clínico completo com câmera intraoral e plano de tratamento.' },
                { id: 'srv-2', name: 'Profilaxia & Limpeza Ultrassônica', price: 190.00, duration: 45, description: 'Remoção de tártaro, placa bacteriana e polimento com jato de bicarbonato.' },
                { id: 'srv-3', name: 'Clareamento Dental a Laser', price: 480.00, duration: 60, description: 'Sessão clareadora com gel fotoativado para sorriso mais radiante.' },
                { id: 'srv-4', name: 'Restauração Estética em Resina', price: 230.00, duration: 50, description: 'Restauração conservadora com acabamento anatômico de alta estética.' }
            ]
        },
        fisioterapia: {
            nicheKey: 'fisioterapia',
            nicheName: 'Fisioterapia & Reabilitação',
            businessName: 'FisioCore Reabilitação Funcional',
            subtitle: 'Alívio da dor, mobilidade articular e prevenção de lesões',
            phone: '5561984260515',
            address: 'Rua Pamplona, 520 - Bela Vista, São Paulo - SP',
            icon: 'activity',
            slotDuration: 50,
            startHour: '07:30',
            endHour: '18:30',
            lunchStart: '12:00',
            lunchEnd: '13:00',
            services: [
                { id: 'srv-1', name: 'Avaliação Fisioterapêutica Inicial', price: 150.00, duration: 50, description: 'Diagnóstico cinesiológico funcional e testes ortopédicos específicos.' },
                { id: 'srv-2', name: 'Sessão Fisioterapia Ortopédica', price: 120.00, duration: 50, description: 'Reabilitação da coluna, quadril, joelho ou ombro com cinesioterapia.' },
                { id: 'srv-3', name: 'Liberação Miofascial & Ventosa', price: 140.00, duration: 45, description: 'Terapia manual intensiva para alívio de nós de tensão e dor muscular.' },
                { id: 'srv-4', name: 'Pilates Clínico Individual', price: 110.00, duration: 50, description: 'Exercícios personalizados para fortalecimento do core e postura.' }
            ]
        },
        salao: {
            nicheKey: 'salao',
            nicheName: 'Salão de Beleza & Hair Studio',
            businessName: 'Studio Belleza & Coiffure',
            subtitle: 'Visagismo, mechas, estética capilar e beleza feminina de alto padrão',
            phone: '5561984260515',
            address: 'Rua Bela Cintra, 1420 - Jardins / Consolação, São Paulo - SP',
            icon: 'sparkles',
            slotDuration: 50,
            startHour: '09:00',
            endHour: '19:30',
            lunchStart: '12:30',
            lunchEnd: '13:30',
            services: [
                { id: 'srv-1', name: 'Corte Visagista & Escova Modelada', price: 120.00, duration: 60, description: 'Corte personalizado alinhado ao formato do rosto com escova e finalização de brilho.' },
                { id: 'srv-2', name: 'Mechas Criativas / Morena Iluminada', price: 380.00, duration: 120, description: 'Técnica exclusiva de iluminação com proteção Plex e reconstrução pós-química.' },
                { id: 'srv-3', name: 'Cronograma Capilar & Nutrição Profunda', price: 140.00, duration: 50, description: 'Tratamento intensivo de reposição lipídica e hidratação com máscara importada.' },
                { id: 'srv-4', name: 'Manicure & Pedicure Spa Completa', price: 75.00, duration: 60, description: 'Cutilagem detalhada, esfoliação com sais relaxantes, hidratação e esmaltação perfeita.' }
            ]
        }
    };

    const AppStore = {
        // Inicializa dados no localStorage se necessário
        init() {
            if (!this.getCurrentNiche()) {
                this.setNiche('barbearia', false);
            } else {
                // Atualização automática de número caso venha de sessão anterior
                const currentSettings = this.getSettings();
                if (currentSettings && (currentSettings.phone === '5511999998888' || !currentSettings.phone)) {
                    currentSettings.phone = '5561984260515';
                    this.saveSettings(currentSettings);
                }
            }
            if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
                this.seedSampleAppointments();
            }
        },

        getCurrentNiche() {
            return localStorage.getItem(STORAGE_KEYS.NICHE) || 'barbearia';
        },

        getNichePresets() {
            return PRESETS;
        },

        setNiche(nicheKey, resetAppointments = false) {
            const preset = PRESETS[nicheKey] || PRESETS.barbearia;
            localStorage.setItem(STORAGE_KEYS.NICHE, nicheKey);

            const settings = {
                businessName: preset.businessName,
                nicheKey: preset.nicheKey,
                nicheName: preset.nicheName,
                subtitle: preset.subtitle,
                phone: preset.phone,
                address: preset.address,
                icon: preset.icon,
                slotDuration: preset.slotDuration,
                startHour: preset.startHour,
                endHour: preset.endHour,
                lunchStart: preset.lunchStart,
                lunchEnd: preset.lunchEnd,
                workDays: [1, 2, 3, 4, 5, 6] // Seg a Sáb
            };

            this.saveSettings(settings);
            this.saveServices(preset.services);

            if (resetAppointments) {
                this.seedSampleAppointments();
            }

            return preset;
        },

        getSettings() {
            try {
                const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
                if (data) return JSON.parse(data);
            } catch (e) {
                console.error('Erro ao ler settings:', e);
            }
            return PRESETS.barbearia;
        },

        saveSettings(settings) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            window.dispatchEvent(new CustomEvent('agendou:settings-updated', { detail: settings }));
        },

        getServices() {
            try {
                const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
                if (data) return JSON.parse(data);
            } catch (e) {
                console.error('Erro ao ler services:', e);
            }
            const currentNiche = this.getCurrentNiche();
            return (PRESETS[currentNiche] || PRESETS.barbearia).services;
        },

        saveServices(services) {
            localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
            window.dispatchEvent(new CustomEvent('agendou:services-updated', { detail: services }));
        },

        getAppointments() {
            try {
                const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
                if (data) return JSON.parse(data);
            } catch (e) {
                console.error('Erro ao ler appointments:', e);
            }
            return [];
        },

        saveAppointments(appointments) {
            localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
            window.dispatchEvent(new CustomEvent('agendou:appointments-updated', { detail: appointments }));
        },

        getAppointmentById(id) {
            const list = this.getAppointments();
            return list.find(item => item.id === id) || null;
        },

        // Checagem blindada de conflito de horários
        isSlotBooked(dateStr, timeStr, excludeId = null) {
            const list = this.getAppointments();
            return list.some(item => {
                if (excludeId && item.id === excludeId) return false;
                // Apenas status confirmados ou pendentes ocupam horário
                return item.date === dateStr && item.time === timeStr && item.status !== 'cancelado';
            });
        },

        // Validação e Adição de Novo Agendamento
        addAppointment(formData) {
            const { name, phone, email, notes, serviceId, date, time } = formData;

            // Validações
            if (!name || name.trim().length < 3) {
                return { success: false, error: 'Por favor, informe seu nome completo (mínimo 3 caracteres).' };
            }

            const cleanPhone = (phone || '').replace(/\D/g, '');
            if (cleanPhone.length < 10) {
                return { success: false, error: 'Por favor, informe um WhatsApp válido com DDD (ex: 11 98888-7777).' };
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email.trim())) {
                return { success: false, error: 'Por favor, informe um endereço de e-mail válido.' };
            }

            if (!serviceId) {
                return { success: false, error: 'Selecione um serviço desejado.' };
            }

            if (!date || !time) {
                return { success: false, error: 'Selecione a data e o horário desejado.' };
            }

            // Validação de data no passado
            const todayStr = this.getTodayDateString();
            if (date < todayStr) {
                return { success: false, error: 'Não é possível agendar em datas passadas.' };
            }

            // Validação de horário passado se for hoje
            if (date === todayStr) {
                const now = new Date();
                const [slotH, slotM] = time.split(':').map(Number);
                const currentH = now.getHours();
                const currentM = now.getMinutes();

                if (slotH < currentH || (slotH === currentH && slotM <= currentM)) {
                    return { success: false, error: 'Este horário já passou no dia de hoje. Escolha outro horário.' };
                }
            }

            // Validação de conflito de horário idêntico
            if (this.isSlotBooked(date, time)) {
                return { success: false, error: 'Desculpe! Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro slot disponível.' };
            }

            const services = this.getServices();
            const service = services.find(s => s.id === serviceId) || {
                name: 'Serviço Selecionado',
                price: 0,
                duration: 45
            };

            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const newAppointment = {
                id: `AGD-${randomCode}`,
                clientName: name.trim(),
                clientPhone: cleanPhone,
                clientEmail: (email || '').trim().toLowerCase(),
                notes: (notes || '').trim(),
                serviceId: service.id,
                serviceName: service.name,
                price: Number(service.price) || 0,
                duration: Number(service.duration) || 45,
                date: date,
                time: time,
                status: 'pendente', // pendente, confirmado, concluido, cancelado
                createdAt: new Date().toISOString()
            };

            const appointments = this.getAppointments();
            appointments.unshift(newAppointment);
            this.saveAppointments(appointments);

            return { success: true, appointment: newAppointment };
        },

        updateAppointmentStatus(id, newStatus) {
            const appointments = this.getAppointments();
            const item = appointments.find(a => a.id === id);
            if (!item) return { success: false, error: 'Agendamento não encontrado.' };

            item.status = newStatus;
            this.saveAppointments(appointments);
            return { success: true, appointment: item };
        },

        rescheduleAppointment(id, newDate, newTime) {
            if (this.isSlotBooked(newDate, newTime, id)) {
                return { success: false, error: 'O novo horário escolhido já está ocupado.' };
            }

            const appointments = this.getAppointments();
            const item = appointments.find(a => a.id === id);
            if (!item) return { success: false, error: 'Agendamento não encontrado.' };

            item.date = newDate;
            item.time = newTime;
            this.saveAppointments(appointments);
            return { success: true, appointment: item };
        },

        deleteAppointment(id) {
            const appointments = this.getAppointments();
            const filtered = appointments.filter(a => a.id !== id);
            this.saveAppointments(filtered);
            return { success: true };
        },

        // Helper para obter string de data de hoje YYYY-MM-DD local
        getTodayDateString(offsetDays = 0) {
            const d = new Date();
            if (offsetDays !== 0) {
                d.setDate(d.getDate() + offsetDays);
            }
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        },

        formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        },

        formatDateBR(dateStr) {
            if (!dateStr) return '';
            const [y, m, d] = dateStr.split('-');
            return `${d}/${m}/${y}`;
        },

        formatDateExtenso(dateStr) {
            if (!dateStr) return '';
            const [y, m, d] = dateStr.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);
            return dateObj.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        },

        // Semente inicial para que a aplicação nunca abra vazia durante testes e demonstrações
        seedSampleAppointments() {
            const today = this.getTodayDateString(0);
            const tomorrow = this.getTodayDateString(1);
            const afterTomorrow = this.getTodayDateString(2);
            const services = this.getServices();

            const srv1 = services[0] || { name: 'Serviço 1', price: 50, duration: 40 };
            const srv2 = services[1] || { name: 'Serviço 2', price: 80, duration: 60 };
            const srv3 = services[2] || { name: 'Serviço 3', price: 120, duration: 50 };

            const sample = [
                {
                    id: 'AGD-3041',
                    clientName: 'Lucas Ferreira Lima',
                    clientPhone: '11984223145',
                    clientEmail: 'lucas.ferreira@gmail.com',
                    notes: 'Prefere corte mais baixo nas laterais.',
                    serviceId: srv1.id || 'srv-1',
                    serviceName: srv1.name,
                    price: srv1.price,
                    duration: srv1.duration,
                    date: today,
                    time: '10:00',
                    status: 'confirmado',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'AGD-4912',
                    clientName: 'Mariana Duarte Souza',
                    clientPhone: '11971239845',
                    clientEmail: 'mariana.duarte@hotmail.com',
                    notes: 'Primeira vez no estabelecimento.',
                    serviceId: srv2.id || 'srv-2',
                    serviceName: srv2.name,
                    price: srv2.price,
                    duration: srv2.duration,
                    date: today,
                    time: '14:30',
                    status: 'pendente',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'AGD-5820',
                    clientName: 'Gabriel Siqueira Costa',
                    clientPhone: '11993448102',
                    clientEmail: 'gabriel.costa@empresa.com',
                    notes: 'Atendimento pontual pois tenho reunião.',
                    serviceId: srv3.id || 'srv-3',
                    serviceName: srv3.name,
                    price: srv3.price,
                    duration: srv3.duration,
                    date: tomorrow,
                    time: '11:00',
                    status: 'confirmado',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'AGD-6194',
                    clientName: 'Camila Albuquerque',
                    clientPhone: '11964228911',
                    clientEmail: 'camila.albuq@yahoo.com.br',
                    notes: '',
                    serviceId: srv1.id || 'srv-1',
                    serviceName: srv1.name,
                    price: srv1.price,
                    duration: srv1.duration,
                    date: afterTomorrow,
                    time: '15:15',
                    status: 'pendente',
                    createdAt: new Date().toISOString()
                }
            ];

            this.saveAppointments(sample);
        }
    };

    // Auto-inicialização do Store
    AppStore.init();

    // Expõe globalmente
    window.AppStore = AppStore;
})(window);
