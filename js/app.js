/**
 * ============================================================================
 * AGENDOU.IO - APPLICATION CONTROLLER & UI ENGINE
 * Vanilla JS Hiper-Funcional, Reativo e Modular
 * ============================================================================
 */

(function (window, document) {
    'use strict';

    const AppUI = {
        currentView: 'client', // 'client' ou 'admin'
        selectedServiceId: null,
        selectedDate: null,
        selectedTime: null,
        calendarMonth: new Date().getMonth(),
        calendarYear: new Date().getFullYear(),
        
        // Admin Filters
        adminStatusFilter: 'all',
        adminDateFilter: 'all',
        adminSearchQuery: '',
        reschedulingAppointmentId: null,

        init() {
            // Configurar data inicial para hoje ou amanhã
            const todayStr = AppStore.getTodayDateString(0);
            this.selectedDate = todayStr;
            this.calendarMonth = new Date().getMonth();
            this.calendarYear = new Date().getFullYear();

            // Selecionar o primeiro serviço por padrão
            const services = AppStore.getServices();
            if (services.length > 0) {
                this.selectedServiceId = services[0].id;
            }

            this.bindEvents();
            this.renderAll();
            this.initIcons();
        },

        initIcons() {
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        },

        bindEvents() {
            // Alternador de Visualização (Cliente / Estabelecimento)
            const btnViewClient = document.getElementById('btnViewClient');
            const btnViewAdmin = document.getElementById('btnViewAdmin');
            if (btnViewClient && btnViewAdmin) {
                btnViewClient.addEventListener('click', () => this.switchView('client'));
                btnViewAdmin.addEventListener('click', () => this.switchView('admin'));
            }

            // Seletor Rápido de Nicho no Topo
            const nicheSelect = document.getElementById('nichePresetSelect');
            if (nicheSelect) {
                nicheSelect.value = AppStore.getCurrentNiche();
                nicheSelect.addEventListener('change', (e) => {
                    const chosen = e.target.value;
                    AppStore.setNiche(chosen, true);
                    this.showToast(`Nicho alterado para "${chosen.toUpperCase()}" com dados atualizados!`, 'info');
                    this.selectedServiceId = (AppStore.getServices()[0] || {}).id || null;
                    this.renderAll();
                });
            }

            // Navegação do Calendário
            const prevMonthBtn = document.getElementById('calPrevMonth');
            const nextMonthBtn = document.getElementById('calNextMonth');
            if (prevMonthBtn) {
                prevMonthBtn.addEventListener('click', () => this.changeCalendarMonth(-1));
            }
            if (nextMonthBtn) {
                nextMonthBtn.addEventListener('click', () => this.changeCalendarMonth(1));
            }

            // Máscara e Validação de Telefone WhatsApp
            const inputPhone = document.getElementById('clientPhone');
            if (inputPhone) {
                inputPhone.addEventListener('input', (e) => {
                    e.target.value = this.maskPhone(e.target.value);
                });
            }

            // Formulário de Agendamento do Cliente
            const bookingForm = document.getElementById('bookingForm');
            if (bookingForm) {
                bookingForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleBookingSubmit();
                });
            }

            // Botão de Limpar/Reiniciar
            const resetBookingBtn = document.getElementById('btnResetBooking');
            if (resetBookingBtn) {
                resetBookingBtn.addEventListener('click', () => {
                    this.resetBookingForm();
                });
            }

            // Admin Filters
            const adminSearchInput = document.getElementById('adminSearchInput');
            if (adminSearchInput) {
                adminSearchInput.addEventListener('input', (e) => {
                    this.adminSearchQuery = e.target.value.toLowerCase().trim();
                    this.renderAdminAppointments();
                });
            }

            // Admin Status Filter Tabs
            const statusFilterTabs = document.querySelectorAll('[data-status-filter]');
            statusFilterTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    statusFilterTabs.forEach(t => {
                        t.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
                        t.classList.add('text-slate-600', 'hover:bg-slate-100');
                    });
                    tab.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
                    tab.classList.remove('text-slate-600', 'hover:bg-slate-100');

                    this.adminStatusFilter = tab.getAttribute('data-status-filter');
                    this.renderAdminAppointments();
                });
            });

            // Admin Date Filter Select
            const adminDateSelect = document.getElementById('adminDateFilter');
            if (adminDateSelect) {
                adminDateSelect.addEventListener('change', (e) => {
                    this.adminDateFilter = e.target.value;
                    this.renderAdminAppointments();
                });
            }

            // Modal de Configurações do Estabelecimento
            const btnOpenSettings = document.getElementById('btnOpenSettings');
            const btnCloseSettings = document.getElementById('btnCloseSettings');
            const settingsModal = document.getElementById('settingsModal');
            const formSettings = document.getElementById('formSettings');

            if (btnOpenSettings && settingsModal) {
                btnOpenSettings.addEventListener('click', () => {
                    this.populateSettingsForm();
                    settingsModal.classList.remove('hidden');
                });
            }

            if (btnCloseSettings && settingsModal) {
                btnCloseSettings.addEventListener('click', () => {
                    settingsModal.classList.add('hidden');
                });
            }

            if (formSettings) {
                formSettings.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleSaveSettings();
                });
            }

            // Botão de Restaurar Dados de Demonstração
            const btnResetDemo = document.getElementById('btnResetDemoData');
            if (btnResetDemo) {
                btnResetDemo.addEventListener('click', () => {
                    if (confirm('Deseja restaurar os agendamentos de exemplo para demonstração?')) {
                        AppStore.seedSampleAppointments();
                        this.showToast('Dados de demonstração restaurados com sucesso!', 'success');
                        this.renderAll();
                        if (settingsModal) settingsModal.classList.add('hidden');
                    }
                });
            }

            // Modal de Remarcar Horário
            const btnCloseReschedule = document.getElementById('btnCloseReschedule');
            const rescheduleModal = document.getElementById('rescheduleModal');
            const formReschedule = document.getElementById('formReschedule');

            if (btnCloseReschedule && rescheduleModal) {
                btnCloseReschedule.addEventListener('click', () => {
                    rescheduleModal.classList.add('hidden');
                    this.reschedulingAppointmentId = null;
                });
            }

            if (formReschedule) {
                formReschedule.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleRescheduleSubmit();
                });
            }

            // Escutadores de Eventos Globais de Atualização do Store
            window.addEventListener('agendou:settings-updated', () => this.renderHeaderAndBranding());
            window.addEventListener('agendou:services-updated', () => {
                this.renderServicesList();
                this.renderLiveSummary();
            });
            window.addEventListener('agendou:appointments-updated', () => {
                this.renderTimeSlots();
                this.renderAdminAppointments();
                this.renderAdminMetrics();
            });
        },

        switchView(view) {
            this.currentView = view;
            const clientSection = document.getElementById('clientViewSection');
            const adminSection = document.getElementById('adminViewSection');
            const btnViewClient = document.getElementById('btnViewClient');
            const btnViewAdmin = document.getElementById('btnViewAdmin');

            if (view === 'client') {
                clientSection.classList.remove('hidden');
                adminSection.classList.add('hidden');
                btnViewClient.className = 'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white shadow-sm transition-all';
                btnViewAdmin.className = 'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all';
                this.renderTimeSlots();
            } else {
                clientSection.classList.add('hidden');
                adminSection.classList.remove('hidden');
                btnViewAdmin.className = 'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white shadow-sm transition-all';
                btnViewClient.className = 'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all';
                this.renderAdminAppointments();
                this.renderAdminMetrics();
            }
            this.initIcons();
        },

        renderAll() {
            this.renderHeaderAndBranding();
            this.renderServicesList();
            this.renderCalendar();
            this.renderTimeSlots();
            this.renderLiveSummary();
            this.renderAdminAppointments();
            this.renderAdminMetrics();
            this.initIcons();
        },

        // Renderiza identidade da empresa (Nome, Subtítulo, WhatsApp, Endereço)
        renderHeaderAndBranding() {
            const settings = AppStore.getSettings();
            
            // Header e Hero
            const brandElements = document.querySelectorAll('.dynamic-business-name');
            brandElements.forEach(el => el.textContent = settings.businessName || 'Agendou.io');

            const subtitleEl = document.getElementById('businessSubtitle');
            if (subtitleEl) subtitleEl.textContent = settings.subtitle || 'Agendamento rápido, seguro e sem complicações.';

            const addressEl = document.getElementById('businessAddress');
            if (addressEl) addressEl.textContent = settings.address || 'São Paulo, SP';

            const phoneBadge = document.getElementById('headerPhoneBadge');
            if (phoneBadge) {
                phoneBadge.href = `https://wa.me/${settings.phone || '5561984260515'}`;
                phoneBadge.innerHTML = `<i data-lucide="phone" class="w-3.5 h-3.5 text-emerald-500"></i> <span class="hidden sm:inline">WhatsApp:</span> ${this.formatPhoneDisplay(settings.phone)}`;
            }

            const openHoursEl = document.getElementById('businessOpenHours');
            if (openHoursEl) {
                openHoursEl.textContent = `Aberto Seg a Sáb: ${settings.startHour} às ${settings.endHour}`;
            }
        },

        // Renderiza lista de serviços disponíveis
        renderServicesList() {
            const container = document.getElementById('servicesListContainer');
            if (!container) return;

            const services = AppStore.getServices();
            container.innerHTML = '';

            if (services.length === 0) {
                container.innerHTML = `<p class="text-sm text-slate-500 p-4 bg-slate-50 rounded-xl">Nenhum serviço cadastrado no momento.</p>`;
                return;
            }

            services.forEach((service, index) => {
                const isSelected = this.selectedServiceId === service.id || (!this.selectedServiceId && index === 0);
                if (isSelected && !this.selectedServiceId) {
                    this.selectedServiceId = service.id;
                }

                const card = document.createElement('div');
                card.className = `cursor-pointer p-4 rounded-2xl border-2 transition-all card-hover-effect relative ${
                    isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`;

                card.innerHTML = `
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-slate-900 text-base">${this.escapeHTML(service.name)}</h4>
                                ${isSelected ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-600 text-white">Selecionado</span>' : ''}
                            </div>
                            <p class="text-xs text-slate-500 mt-1 line-clamp-2">${this.escapeHTML(service.description || '')}</p>
                            
                            <div class="flex items-center gap-3 mt-3">
                                <span class="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                    <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i> ${service.duration} min
                                </span>
                                <span class="text-sm font-extrabold text-indigo-700">
                                    ${AppStore.formatCurrency(service.price)}
                                </span>
                            </div>
                        </div>

                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                        }">
                            ${isSelected ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : ''}
                        </div>
                    </div>
                `;

                card.addEventListener('click', () => {
                    this.selectedServiceId = service.id;
                    this.renderServicesList();
                    this.renderLiveSummary();
                    this.initIcons();
                });

                container.appendChild(card);
            });

            this.initIcons();
        },

        // Renderiza o Calendário Interativo Moderno
        renderCalendar() {
            const monthNames = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];

            const titleEl = document.getElementById('calMonthTitle');
            if (titleEl) {
                titleEl.textContent = `${monthNames[this.calendarMonth]} ${this.calendarYear}`;
            }

            const grid = document.getElementById('calendarDaysGrid');
            if (!grid) return;

            grid.innerHTML = '';

            const firstDayIndex = new Date(this.calendarYear, this.calendarMonth, 1).getDay(); // 0 = Dom, 6 = Sab
            const totalDaysInMonth = new Date(this.calendarYear, this.calendarMonth + 1, 0).getDate();

            const today = new Date();
            const todayYear = today.getFullYear();
            const todayMonth = today.getMonth();
            const todayDate = today.getDate();

            // Células em branco antes do primeiro dia
            for (let i = 0; i < firstDayIndex; i++) {
                const blankCell = document.createElement('div');
                blankCell.className = 'h-10';
                grid.appendChild(blankCell);
            }

            const settings = AppStore.getSettings();
            const workDays = settings.workDays || [1, 2, 3, 4, 5, 6];

            // Renderiza cada dia do mês
            for (let day = 1; day <= totalDaysInMonth; day++) {
                const dateObj = new Date(this.calendarYear, this.calendarMonth, day);
                const dayOfWeek = dateObj.getDay();

                const monthStr = String(this.calendarMonth + 1).padStart(2, '0');
                const dayStr = String(day).padStart(2, '0');
                const dateString = `${this.calendarYear}-${monthStr}-${dayStr}`;

                // Verifica se é passado
                const isPast = (
                    this.calendarYear < todayYear ||
                    (this.calendarYear === todayYear && this.calendarMonth < todayMonth) ||
                    (this.calendarYear === todayYear && this.calendarMonth === todayMonth && day < todayDate)
                );

                // Verifica se dia de trabalho
                const isWorkDay = workDays.includes(dayOfWeek);
                const isToday = (this.calendarYear === todayYear && this.calendarMonth === todayMonth && day === todayDate);
                const isSelected = (this.selectedDate === dateString);

                const dayBtn = document.createElement('button');
                dayBtn.type = 'button';

                if (isPast || !isWorkDay) {
                    dayBtn.disabled = true;
                    dayBtn.className = 'h-10 w-full rounded-xl text-xs font-medium text-slate-300 cursor-not-allowed flex flex-col items-center justify-center';
                    dayBtn.innerHTML = `
                        <span>${day}</span>
                        ${!isWorkDay && !isPast ? '<span class="text-[9px] text-slate-400">Folga</span>' : ''}
                    `;
                } else {
                    dayBtn.className = `h-10 w-full rounded-xl text-sm font-semibold flex items-center justify-center transition-all ${
                        isSelected
                            ? 'bg-indigo-600 text-white shadow-md scale-105 font-bold ring-2 ring-indigo-300'
                            : isToday
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                                : 'text-slate-700 hover:bg-slate-100'
                    }`;

                    dayBtn.textContent = day;

                    dayBtn.addEventListener('click', () => {
                        this.selectedDate = dateString;
                        this.selectedTime = null; // Reseta horário para o novo dia
                        this.renderCalendar();
                        this.renderTimeSlots();
                        this.renderLiveSummary();
                    });
                }

                grid.appendChild(dayBtn);
            }
        },

        changeCalendarMonth(direction) {
            this.calendarMonth += direction;
            if (this.calendarMonth < 0) {
                this.calendarMonth = 11;
                this.calendarYear -= 1;
            } else if (this.calendarMonth > 11) {
                this.calendarMonth = 0;
                this.calendarYear += 1;
            }
            this.renderCalendar();
        },

        // Gerador e Renderizador de Slots de Horários
        renderTimeSlots() {
            const container = document.getElementById('timeSlotsContainer');
            const dateBadge = document.getElementById('selectedDateSlotBadge');
            if (!container) return;

            container.innerHTML = '';

            if (!this.selectedDate) {
                container.innerHTML = `<p class="col-span-full text-center text-sm text-slate-500 py-6">Selecione uma data no calendário acima.</p>`;
                return;
            }

            if (dateBadge) {
                dateBadge.textContent = AppStore.formatDateBR(this.selectedDate);
            }

            const settings = AppStore.getSettings();
            const slots = this.generateSlots(
                settings.startHour || '08:00',
                settings.endHour || '19:00',
                Number(settings.slotDuration) || 45,
                settings.lunchStart || '12:00',
                settings.lunchEnd || '13:00'
            );

            if (slots.length === 0) {
                container.innerHTML = `<p class="col-span-full text-center text-sm text-slate-500 py-6">Nenhum horário disponível para esta data.</p>`;
                return;
            }

            const todayStr = AppStore.getTodayDateString(0);
            const isToday = (this.selectedDate === todayStr);
            const now = new Date();
            const currentHour = now.getHours();
            const currentMin = now.getMinutes();

            let availableSlotsCount = 0;

            slots.forEach(slotTime => {
                const [slotH, slotM] = slotTime.split(':').map(Number);
                
                // Checa se o horário já passou hoje
                const isPastSlot = isToday && (slotH < currentHour || (slotH === currentHour && slotM <= currentMin));
                
                // Checa se já está ocupado no store
                const isBooked = AppStore.isSlotBooked(this.selectedDate, slotTime);

                const isAvailable = !isPastSlot && !isBooked;
                if (isAvailable) availableSlotsCount++;

                const isSelected = (this.selectedTime === slotTime);

                const slotBtn = document.createElement('button');
                slotBtn.type = 'button';

                if (isBooked) {
                    slotBtn.disabled = true;
                    slotBtn.className = 'p-2.5 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-400 cursor-not-allowed flex flex-col items-center justify-center opacity-70';
                    slotBtn.innerHTML = `
                        <span class="line-through">${slotTime}</span>
                        <span class="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Ocupado</span>
                    `;
                } else if (isPastSlot) {
                    slotBtn.disabled = true;
                    slotBtn.className = 'p-2.5 rounded-xl text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed flex flex-col items-center justify-center';
                    slotBtn.innerHTML = `
                        <span class="line-through">${slotTime}</span>
                        <span class="text-[10px] text-slate-400">Passou</span>
                    `;
                } else {
                    slotBtn.className = `p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                        isSelected
                            ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400 scale-105'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm'
                    }`;

                    slotBtn.innerHTML = `
                        <span>${slotTime}</span>
                        <span class="text-[10px] ${isSelected ? 'text-indigo-200' : 'text-emerald-600 font-semibold'}">Livre</span>
                    `;

                    slotBtn.addEventListener('click', () => {
                        this.selectedTime = slotTime;
                        this.renderTimeSlots();
                        this.renderLiveSummary();
                    });
                }

                container.appendChild(slotBtn);
            });

            const slotsStatusIndicator = document.getElementById('slotsAvailabilityNotice');
            if (slotsStatusIndicator) {
                slotsStatusIndicator.innerHTML = availableSlotsCount > 0
                    ? `<span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ${availableSlotsCount} horários disponíveis</span>`
                    : `<span class="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Todos os horários esgotados nesta data</span>`;
            }
        },

        // Algoritmo de geração de slots horários
        generateSlots(startStr, endStr, intervalMin, lunchStartStr, lunchEndStr) {
            const slots = [];
            const [sH, sM] = startStr.split(':').map(Number);
            const [eH, eM] = endStr.split(':').map(Number);

            const [lStartH, lStartM] = (lunchStartStr || '12:00').split(':').map(Number);
            const [lEndH, lEndM] = (lunchEndStr || '13:00').split(':').map(Number);

            let currentMinutes = sH * 60 + sM;
            const endMinutes = eH * 60 + eM;
            const lunchStartMinutes = lStartH * 60 + lStartM;
            const lunchEndMinutes = lEndH * 60 + lEndM;

            while (currentMinutes + intervalMin <= endMinutes) {
                // Checa intervalo de almoço
                const slotEndMinutes = currentMinutes + intervalMin;
                const isInLunch = (
                    (currentMinutes >= lunchStartMinutes && currentMinutes < lunchEndMinutes) ||
                    (slotEndMinutes > lunchStartMinutes && slotEndMinutes <= lunchEndMinutes)
                );

                if (!isInLunch) {
                    const h = Math.floor(currentMinutes / 60);
                    const m = currentMinutes % 60;
                    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                }

                currentMinutes += intervalMin;
            }

            return slots;
        },

        // Renderiza o Resumo em Tempo Real na coluna direita
        renderLiveSummary() {
            const summaryService = document.getElementById('summaryServiceName');
            const summaryPrice = document.getElementById('summaryServicePrice');
            const summaryDuration = document.getElementById('summaryServiceDuration');
            const summaryDate = document.getElementById('summaryDate');
            const summaryTime = document.getElementById('summaryTime');
            const summaryTotal = document.getElementById('summaryTotalPrice');
            const btnSubmit = document.getElementById('btnSubmitBooking');

            const services = AppStore.getServices();
            const currentService = services.find(s => s.id === this.selectedServiceId) || services[0] || null;

            if (currentService) {
                if (summaryService) summaryService.textContent = currentService.name;
                if (summaryPrice) summaryPrice.textContent = AppStore.formatCurrency(currentService.price);
                if (summaryDuration) summaryDuration.textContent = `${currentService.duration} min`;
                if (summaryTotal) summaryTotal.textContent = AppStore.formatCurrency(currentService.price);
            }

            if (summaryDate) {
                summaryDate.textContent = this.selectedDate ? AppStore.formatDateBR(this.selectedDate) : 'Não selecionada';
            }

            if (summaryTime) {
                summaryTime.textContent = this.selectedTime ? `${this.selectedTime}h` : 'Não selecionado';
            }

            if (btnSubmit) {
                const canSubmit = !!(this.selectedDate && this.selectedTime && this.selectedServiceId);
                btnSubmit.disabled = !canSubmit;
                if (!canSubmit) {
                    btnSubmit.classList.add('opacity-60', 'cursor-not-allowed');
                } else {
                    btnSubmit.classList.remove('opacity-60', 'cursor-not-allowed');
                }
            }
        },

        // Submissão do Agendamento pelo Cliente
        handleBookingSubmit() {
            const name = document.getElementById('clientName').value;
            const phone = document.getElementById('clientPhone').value;
            const email = document.getElementById('clientEmail').value;
            const notes = document.getElementById('clientNotes').value;

            const payload = {
                name,
                phone,
                email,
                notes,
                serviceId: this.selectedServiceId,
                date: this.selectedDate,
                time: this.selectedTime
            };

            const result = AppStore.addAppointment(payload);

            if (!result.success) {
                this.showToast(result.error, 'error');
                return;
            }

            // Sucesso!
            this.showToast('Agendamento realizado com sucesso!', 'success');
            this.openTicketModal(result.appointment);
            this.resetBookingForm();
            this.renderTimeSlots();
            this.renderAdminAppointments();
            this.renderAdminMetrics();
        },

        // Resetar Campos do Formulário
        resetBookingForm() {
            const form = document.getElementById('bookingForm');
            if (form) form.reset();
            this.selectedTime = null;
            this.renderTimeSlots();
            this.renderLiveSummary();
        },

        // Abertura do Modal de Confirmação & Voucher Digital com Automação WhatsApp
        openTicketModal(appointment) {
            const modal = document.getElementById('ticketModal');
            if (!modal) return;

            const settings = AppStore.getSettings();

            // Preenchimento dos dados no Ticket
            document.getElementById('ticketCode').textContent = `#${appointment.id}`;
            document.getElementById('ticketClientName').textContent = appointment.clientName;
            document.getElementById('ticketClientPhone').textContent = this.formatPhoneDisplay(appointment.clientPhone);
            document.getElementById('ticketServiceName').textContent = appointment.serviceName;
            document.getElementById('ticketDate').textContent = AppStore.formatDateBR(appointment.date);
            document.getElementById('ticketTime').textContent = `${appointment.time}h`;
            document.getElementById('ticketDuration').textContent = `${appointment.duration} minutos`;
            document.getElementById('ticketPrice').textContent = AppStore.formatCurrency(appointment.price);
            document.getElementById('ticketBusinessName').textContent = settings.businessName;
            document.getElementById('ticketAddress').textContent = settings.address;

            // Gerador de Mensagem WhatsApp Automática
            const targetPhone = (settings.phone || '5561984260515').replace(/\D/g, '');
            const msg = `*CONFIRMAÇÃO DE AGENDAMENTO* 🗓️%0A%0A` +
                `Olá, meu nome é *${encodeURIComponent(appointment.clientName)}*! Gostaria de confirmar meu agendamento no *${encodeURIComponent(settings.businessName)}*:%0A%0A` +
                `✂️ *Serviço:* ${encodeURIComponent(appointment.serviceName)}%0A` +
                `📅 *Data:* ${AppStore.formatDateBR(appointment.date)}%0A` +
                `⏰ *Horário:* ${appointment.time}h%0A` +
                `⏳ *Duração Estimada:* ${appointment.duration} min%0A` +
                `💰 *Valor:* ${encodeURIComponent(AppStore.formatCurrency(appointment.price))}%0A` +
                `🆔 *Código do Agendamento:* #${appointment.id}%0A%0A` +
                `Aguardo sua confirmação. Muito obrigado!`;

            const whatsappUrl = `https://wa.me/${targetPhone}?text=${msg}`;
            const btnWhatsApp = document.getElementById('btnWhatsAppTicket');
            if (btnWhatsApp) {
                btnWhatsApp.href = whatsappUrl;
            }

            // Gerador de Link para Google Agenda
            const googleCalUrl = this.generateGoogleCalendarUrl(appointment, settings);
            const btnGoogleCal = document.getElementById('btnGoogleCalTicket');
            if (btnGoogleCal) {
                btnGoogleCal.href = googleCalUrl;
            }

            // Botão Fechar Modal
            const btnCloseTicket = document.getElementById('btnCloseTicketModal');
            if (btnCloseTicket) {
                btnCloseTicket.onclick = () => modal.classList.add('hidden');
            }

            modal.classList.remove('hidden');
            this.initIcons();
        },

        generateGoogleCalendarUrl(appointment, settings) {
            const [y, m, d] = appointment.date.split('-');
            const [h, min] = appointment.time.split(':');
            const startDate = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min));
            const endDate = new Date(startDate.getTime() + (Number(appointment.duration) || 45) * 60000);

            const formatGTime = (dateObj) => {
                return dateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
            };

            const title = encodeURIComponent(`${appointment.serviceName} - ${settings.businessName}`);
            const details = encodeURIComponent(`Agendamento de ${appointment.serviceName} para ${appointment.clientName}. Código: #${appointment.id}. Valor: ${AppStore.formatCurrency(appointment.price)}.`);
            const location = encodeURIComponent(settings.address || '');

            return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGTime(startDate)}/${formatGTime(endDate)}&details=${details}&location=${location}`;
        },

        // Renderiza a Lista de Agendamentos no Painel do Administrador
        renderAdminAppointments() {
            const tableBody = document.getElementById('adminAppointmentsTableBody');
            const countBadge = document.getElementById('adminFilteredCountBadge');
            if (!tableBody) return;

            tableBody.innerHTML = '';

            let appointments = AppStore.getAppointments();

            // Filtro por Data
            const todayStr = AppStore.getTodayDateString(0);
            const tomorrowStr = AppStore.getTodayDateString(1);

            if (this.adminDateFilter === 'today') {
                appointments = appointments.filter(a => a.date === todayStr);
            } else if (this.adminDateFilter === 'tomorrow') {
                appointments = appointments.filter(a => a.date === tomorrowStr);
            } else if (this.adminDateFilter === 'week') {
                const now = new Date();
                const weekEnd = new Date();
                weekEnd.setDate(now.getDate() + 7);
                const weekEndStr = weekEnd.toISOString().split('T')[0];
                appointments = appointments.filter(a => a.date >= todayStr && a.date <= weekEndStr);
            }

            // Filtro por Status
            if (this.adminStatusFilter !== 'all') {
                appointments = appointments.filter(a => a.status === this.adminStatusFilter);
            }

            // Filtro por Busca de Texto
            if (this.adminSearchQuery) {
                const q = this.adminSearchQuery;
                appointments = appointments.filter(a =>
                    a.clientName.toLowerCase().includes(q) ||
                    a.clientPhone.includes(q) ||
                    a.serviceName.toLowerCase().includes(q) ||
                    a.id.toLowerCase().includes(q)
                );
            }

            if (countBadge) {
                countBadge.textContent = `${appointments.length} registros`;
            }

            if (appointments.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-12 text-slate-400 bg-white">
                            <i data-lucide="calendar-x" class="w-10 h-10 mx-auto text-slate-300 mb-2"></i>
                            <p class="font-medium text-slate-600">Nenhum agendamento encontrado para os filtros selecionados.</p>
                            <p class="text-xs text-slate-400 mt-1">Tente alternar o filtro de status ou de data.</p>
                        </td>
                    </tr>
                `;
                this.initIcons();
                return;
            }

            appointments.forEach(apt => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-slate-100 hover:bg-slate-50/70 transition-colors bg-white';

                const statusBadges = {
                    confirmado: '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Confirmado</span>',
                    pendente: '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pendente</span>',
                    concluido: '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Concluído</span>',
                    cancelado: '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Cancelado</span>'
                };

                const cleanClientPhone = (apt.clientPhone || '').replace(/\D/g, '');
                const clientWhatsAppMsg = encodeURIComponent(`Olá ${apt.clientName}! Aqui é do ${AppStore.getSettings().businessName}. Entramos em contato referente ao seu agendamento de ${apt.serviceName} no dia ${AppStore.formatDateBR(apt.date)} às ${apt.time}h.`);
                const clientWhatsAppLink = `https://wa.me/55${cleanClientPhone}?text=${clientWhatsAppMsg}`;

                tr.innerHTML = `
                    <td class="py-4 px-4">
                        <div class="flex items-center gap-2">
                            <span class="font-mono text-xs font-bold text-slate-500">#${apt.id}</span>
                        </div>
                        <div class="font-bold text-slate-900 text-sm mt-0.5">${this.escapeHTML(apt.clientName)}</div>
                        <div class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <i data-lucide="phone" class="w-3 h-3 text-emerald-500"></i> ${this.formatPhoneDisplay(apt.clientPhone)}
                        </div>
                    </td>

                    <td class="py-4 px-4">
                        <div class="text-sm font-semibold text-slate-900">${this.escapeHTML(apt.serviceName)}</div>
                        <div class="text-xs text-indigo-700 font-bold">${AppStore.formatCurrency(apt.price)} • ${apt.duration} min</div>
                    </td>

                    <td class="py-4 px-4">
                        <div class="text-sm font-bold text-slate-900">${AppStore.formatDateBR(apt.date)}</div>
                        <div class="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-0.5">
                            <i data-lucide="clock" class="w-3 h-3"></i> ${apt.time}h
                        </div>
                    </td>

                    <td class="py-4 px-4">
                        ${statusBadges[apt.status] || apt.status}
                    </td>

                    <td class="py-4 px-4 max-w-xs">
                        <p class="text-xs text-slate-500 truncate" title="${this.escapeHTML(apt.notes || 'Sem observações')}">
                            ${apt.notes ? this.escapeHTML(apt.notes) : '<span class="text-slate-300 italic">Nenhuma</span>'}
                        </p>
                    </td>

                    <td class="py-4 px-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            <!-- Botão WhatsApp direto com o cliente -->
                            <a href="${clientWhatsAppLink}" target="_blank" title="Enviar WhatsApp ao cliente"
                               class="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors">
                                <i data-lucide="message-circle" class="w-4 h-4"></i>
                            </a>

                            <!-- Botão Confirmar -->
                            ${apt.status !== 'confirmado' ? `
                                <button type="button" data-action="confirm" data-id="${apt.id}" title="Confirmar agendamento"
                                    class="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                                    <i data-lucide="check-check" class="w-4 h-4"></i>
                                </button>
                            ` : ''}

                            <!-- Botão Remarcar -->
                            <button type="button" data-action="reschedule" data-id="${apt.id}" title="Remarcar data/horário"
                                class="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-colors">
                                <i data-lucide="calendar-sync" class="w-4 h-4"></i>
                            </button>

                            <!-- Botão Cancelar -->
                            ${apt.status !== 'cancelado' ? `
                                <button type="button" data-action="cancel" data-id="${apt.id}" title="Cancelar agendamento"
                                    class="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors">
                                    <i data-lucide="x" class="w-4 h-4"></i>
                                </button>
                            ` : ''}

                            <!-- Botão Excluir -->
                            <button type="button" data-action="delete" data-id="${apt.id}" title="Excluir do histórico"
                                class="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                `;

                // Ações da Linha
                tr.querySelectorAll('[data-action]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const action = btn.getAttribute('data-action');
                        const id = btn.getAttribute('data-id');
                        this.handleAdminAction(action, id);
                    });
                });

                tableBody.appendChild(tr);
            });

            this.initIcons();
        },

        // Processa ações rápidas do Admin
        handleAdminAction(action, id) {
            if (action === 'confirm') {
                AppStore.updateAppointmentStatus(id, 'confirmado');
                this.showToast(`Agendamento #${id} confirmado!`, 'success');
            } else if (action === 'cancel') {
                if (confirm(`Deseja realmente cancelar o agendamento #${id}? O horário será liberado.`)) {
                    AppStore.updateAppointmentStatus(id, 'cancelado');
                    this.showToast(`Agendamento #${id} cancelado e horário liberado.`, 'info');
                }
            } else if (action === 'delete') {
                if (confirm(`Deseja excluir permanentemente o agendamento #${id}?`)) {
                    AppStore.deleteAppointment(id);
                    this.showToast(`Agendamento #${id} excluído com sucesso.`, 'info');
                }
            } else if (action === 'reschedule') {
                this.openRescheduleModal(id);
            }
        },

        // Modal de Remarcação
        openRescheduleModal(id) {
            const apt = AppStore.getAppointmentById(id);
            if (!apt) return;

            this.reschedulingAppointmentId = id;
            const modal = document.getElementById('rescheduleModal');
            if (!modal) return;

            document.getElementById('rescheduleClientInfo').textContent = `${apt.clientName} (#${apt.id}) - ${apt.serviceName}`;
            document.getElementById('rescheduleCurrentSlot').textContent = `Atual: ${AppStore.formatDateBR(apt.date)} às ${apt.time}h`;

            const inputDate = document.getElementById('rescheduleDate');
            inputDate.value = apt.date;
            inputDate.min = AppStore.getTodayDateString(0);

            // Popula opções de horário
            this.populateRescheduleTimes(apt.date, apt.time, id);

            inputDate.onchange = () => {
                this.populateRescheduleTimes(inputDate.value, null, id);
            };

            modal.classList.remove('hidden');
            this.initIcons();
        },

        populateRescheduleTimes(dateStr, defaultTime, excludeId) {
            const select = document.getElementById('rescheduleTimeSelect');
            if (!select) return;

            select.innerHTML = '';
            const settings = AppStore.getSettings();
            const slots = this.generateSlots(
                settings.startHour || '08:00',
                settings.endHour || '19:00',
                Number(settings.slotDuration) || 45,
                settings.lunchStart || '12:00',
                settings.lunchEnd || '13:00'
            );

            let addedCount = 0;
            slots.forEach(slot => {
                const isBooked = AppStore.isSlotBooked(dateStr, slot, excludeId);
                const opt = document.createElement('option');
                opt.value = slot;
                opt.textContent = isBooked ? `${slot} (Ocupado)` : `${slot} (Disponível)`;
                opt.disabled = isBooked;

                if (slot === defaultTime) {
                    opt.selected = true;
                }
                select.appendChild(opt);
                addedCount++;
            });
        },

        handleRescheduleSubmit() {
            if (!this.reschedulingAppointmentId) return;

            const newDate = document.getElementById('rescheduleDate').value;
            const newTime = document.getElementById('rescheduleTimeSelect').value;

            if (!newDate || !newTime) {
                this.showToast('Selecione nova data e novo horário.', 'error');
                return;
            }

            const res = AppStore.rescheduleAppointment(this.reschedulingAppointmentId, newDate, newTime);
            if (res.success) {
                this.showToast(`Agendamento remarcado com sucesso para ${AppStore.formatDateBR(newDate)} às ${newTime}h!`, 'success');
                document.getElementById('rescheduleModal').classList.add('hidden');
                this.reschedulingAppointmentId = null;
            } else {
                this.showToast(res.error, 'error');
            }
        },

        // Renderiza Indicadores (KPIs) do Painel
        renderAdminMetrics() {
            const appointments = AppStore.getAppointments();
            const todayStr = AppStore.getTodayDateString(0);

            const total = appointments.length;
            const confirmed = appointments.filter(a => a.status === 'confirmado').length;
            const pending = appointments.filter(a => a.status === 'pendente').length;
            const todayCount = appointments.filter(a => a.date === todayStr && a.status !== 'cancelado').length;

            const revenue = appointments
                .filter(a => a.status === 'confirmado' || a.status === 'concluido')
                .reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

            const elTotal = document.getElementById('kpiTotalApts');
            const elConfirmed = document.getElementById('kpiConfirmedApts');
            const elPending = document.getElementById('kpiPendingApts');
            const elToday = document.getElementById('kpiTodayApts');
            const elRevenue = document.getElementById('kpiEstimatedRevenue');

            if (elTotal) elTotal.textContent = total;
            if (elConfirmed) elConfirmed.textContent = confirmed;
            if (elPending) elPending.textContent = pending;
            if (elToday) elToday.textContent = todayCount;
            if (elRevenue) elRevenue.textContent = AppStore.formatCurrency(revenue);
        },

        // Preenche o formulário de configurações
        populateSettingsForm() {
            const settings = AppStore.getSettings();
            document.getElementById('cfgBusinessName').value = settings.businessName || '';
            document.getElementById('cfgSubtitle').value = settings.subtitle || '';
            document.getElementById('cfgPhone').value = settings.phone || '';
            document.getElementById('cfgAddress').value = settings.address || '';
            document.getElementById('cfgStartHour').value = settings.startHour || '08:00';
            document.getElementById('cfgEndHour').value = settings.endHour || '19:00';
            document.getElementById('cfgSlotDuration').value = settings.slotDuration || 45;
            document.getElementById('cfgLunchStart').value = settings.lunchStart || '12:00';
            document.getElementById('cfgLunchEnd').value = settings.lunchEnd || '13:00';

            this.renderServicesManagementList();
        },

        renderServicesManagementList() {
            const container = document.getElementById('cfgServicesContainer');
            if (!container) return;

            const services = AppStore.getServices();
            container.innerHTML = '';

            services.forEach((s, idx) => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl';
                item.innerHTML = `
                    <div>
                        <div class="font-bold text-xs text-slate-800">${this.escapeHTML(s.name)}</div>
                        <div class="text-[11px] text-slate-500">${AppStore.formatCurrency(s.price)} • ${s.duration} min</div>
                    </div>
                    <button type="button" data-del-service="${s.id}" class="text-rose-500 hover:text-rose-700 p-1">
                        <i data-lucide="trash" class="w-4 h-4"></i>
                    </button>
                `;

                item.querySelector('[data-del-service]').addEventListener('click', () => {
                    const updated = services.filter(item => item.id !== s.id);
                    AppStore.saveServices(updated);
                    this.renderServicesManagementList();
                });

                container.appendChild(item);
            });

            this.initIcons();
        },

        handleSaveSettings() {
            const settings = AppStore.getSettings();
            settings.businessName = document.getElementById('cfgBusinessName').value.trim();
            settings.subtitle = document.getElementById('cfgSubtitle').value.trim();
            settings.phone = document.getElementById('cfgPhone').value.replace(/\D/g, '');
            settings.address = document.getElementById('cfgAddress').value.trim();
            settings.startHour = document.getElementById('cfgStartHour').value;
            settings.endHour = document.getElementById('cfgEndHour').value;
            settings.slotDuration = Number(document.getElementById('cfgSlotDuration').value) || 45;
            settings.lunchStart = document.getElementById('cfgLunchStart').value;
            settings.lunchEnd = document.getElementById('cfgLunchEnd').value;

            // Adição de novo serviço opcional no formulário de config
            const newName = document.getElementById('cfgNewServiceName').value.trim();
            const newPrice = parseFloat(document.getElementById('cfgNewServicePrice').value);
            const newDuration = parseInt(document.getElementById('cfgNewServiceDuration').value, 10);

            if (newName && !isNaN(newPrice) && !isNaN(newDuration)) {
                const services = AppStore.getServices();
                services.push({
                    id: `srv-${Date.now()}`,
                    name: newName,
                    price: newPrice,
                    duration: newDuration,
                    description: 'Serviço personalizado adicionado nas configurações.'
                });
                AppStore.saveServices(services);
                document.getElementById('cfgNewServiceName').value = '';
                document.getElementById('cfgNewServicePrice').value = '';
                document.getElementById('cfgNewServiceDuration').value = '';
            }

            AppStore.saveSettings(settings);
            document.getElementById('settingsModal').classList.add('hidden');
            this.showToast('Configurações salvas com sucesso!', 'success');
            this.renderAll();
        },

        // Sistema de Notificações Toast Moderno
        showToast(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            if (!container) return;

            const toast = document.createElement('div');
            const bgTypes = {
                success: 'bg-emerald-600 text-white',
                error: 'bg-rose-600 text-white',
                info: 'bg-indigo-600 text-white'
            };

            const iconTypes = {
                success: 'check-circle',
                error: 'alert-triangle',
                info: 'info'
            };

            toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold toast-enter ${bgTypes[type] || bgTypes.info}`;
            toast.innerHTML = `
                <i data-lucide="${iconTypes[type] || 'info'}" class="w-5 h-5 shrink-0"></i>
                <span class="flex-1">${this.escapeHTML(message)}</span>
            `;

            container.appendChild(toast);
            this.initIcons();

            setTimeout(() => {
                toast.classList.remove('toast-enter');
                toast.classList.add('toast-exit');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        },

        // Helpers de Formatação e Segurança
        maskPhone(val) {
            let num = val.replace(/\D/g, '');
            if (num.length > 11) num = num.slice(0, 11);
            if (num.length <= 2) return num.replace(/^(\d{0,2})/, '($1');
            if (num.length <= 6) return num.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
            if (num.length <= 10) return num.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            return num.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        },

        formatPhoneDisplay(phone) {
            if (!phone) return '';
            const clean = phone.replace(/\D/g, '');
            if (clean.length === 11) {
                return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (clean.length === 10) {
                return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
            return phone;
        },

        escapeHTML(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    };

    // Inicialização ao carregar a página
    document.addEventListener('DOMContentLoaded', () => {
        AppUI.init();
    });

    window.AppUI = AppUI;
})(window, document);
