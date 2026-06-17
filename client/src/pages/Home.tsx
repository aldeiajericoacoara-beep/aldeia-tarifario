import { useState, useEffect } from "react";
import { 
  Building, Globe, ShieldAlert, Check, RefreshCw, Calendar as CalendarIcon, 
  BookOpen, Palette, Percent, Info, AlertTriangle, Moon, CreditCard, 
  CalendarX, Home as HomeIcon, DollarSign, Ban, ChevronUp, ChevronDown, Trash, Plus
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { loadRateSheetData, saveRateSheetData } from "@/lib/rateSheetStorage";

// Estilos de Paleta baseados na Abordagem 1: "Organic Sanctuary"
const PAL = {
  blue:  ["#F0FDF4", "#166534", "#86EFAC"], // Verde suave orgânico
  amber: ["#FEF3C7", "#92400E", "#F59E0B"], // Âmbar / Sol
  red:   ["#FEE2E2", "#991B1B", "#EF4444"], // Vermelho sutil para Alta
  purple:["#F3E8FF", "#6B21A8", "#A855F7"], // Roxo para Réveillon
  teal:  ["#ECFDF5", "#0F766E", "#34D399"], // Lagoa
  green: ["#DCFCE7", "#14532D", "#22C55E"], // Vegetação
  coral: ["#FFEDD5", "#9A3412", "#F97316"], // Areia quente
  gray:  ["#F3F4F6", "#374151", "#9CA3AF"], // Neutro
};

const I18N = {
  pt: {
    subtitle: "Tarifário Dinâmico · V1 2026/2027 · Confidencial",
    saved: "✓ Salvo", saving: "Salvando...", resetBtn: "Resetar", resetConfirm: "Confirmar", resetCancel: "Cancelar",
    t1: "Tarifário", t2: "Concorrentes", t3: "Calendário", t4: "Regras", t5: "Temporadas & Canais", t6: "Descontos",
    rHint: "Clique em qualquer valor pontilhado para editar. Preços de canal recalculam automaticamente.",
    floor: "Piso NET", minNights: "Min. Diárias", net: "NET", direct: "PIX / Direto",
    disc: "Desc.", auth: "Autorização", group: "Grupo",
    compNote: "Fonte: Booking.com 2026.", compLegend: "Verde = abaixo média NET · Vermelho = acima.",
    visual: "Visual", editMode: "Editar",
    legend: "Legenda:", holidayDot: "= feriado (passe o mouse para ver)",
    rangesTitle: "Faixas de Temporada", holidaysTitle: "Feriados e Datas Especiais",
    startCol: "Início", endCol: "Fim", seasonCol: "Temporada", descCol: "Descrição",
    dateCol: "Data", nameCol: "Nome",
    addPeriod: "+ Adicionar período", addHoliday: "+ Adicionar feriado", addLine: "+ Adicionar linha",
    editHint: "Clique em qualquer campo para editar. Use a lixeira para remover e + Adicionar para novas linhas.",
    dateHint: "Formato: DD/MM/AA",
    calRefTitle: "Calendário de Referência (Texto)",
    period: "Período", dates: "Datas", obs: "Observação",
    minStayTitle: "Estadias Mínimas", villasCol: "Vilas (A & B)", suitesCol: "Suítes & Aptos (C & D)",
    payTitle: "Métodos de Pagamento", methodCol: "Método", feeCol: "Taxa", prioCol: "Prioridade", actionCol: "Ação",
    gapTitle: "Gestão de Gaps", gapCol: "Gap", highCol: "Alta Temporada (HIGH/NYE)", lowCol: "Baixa / Média (LOW/MID)",
    privTitle: "Privatização vs Venda por Quarto", roomsCol: "Quartos reservados", requestCol: "Solicitação", decisionCol: "Decisão",
    conceptsTitle: "Conceitos Fundamentais de Preço",
    ruleGold: "Regra de Ouro: Desconto sempre calculado sobre o NET — nunca sobre o preço publicado no canal. Descontar sobre o preço OTA apenas reduz a margem do canal.",
    seasonsTitle: "Temporadas",
    seasonsHint: "Renomeie e/ou mude a cor. Todas as tabelas e o calendário visual atualizam em tempo real.",
    colorLabel: "Cor:", channelsTitle: "Canais e Comissões",
    channelsHint: "Altere a comissão e os preços recalculam automaticamente.",
    chanCol: "Canal", commCol: "Comissão", divCol: "Divisor", netRcvCol: "NET recebido", prioStars: "Prioridade",
    discAlert: "Descontos sempre calculados sobre o NET — nunca sobre o preço publicado no canal.",
    levelCol: "Nível", authCol: "Quem autoriza", sitCol: "Situação típica", grpCol: "Grupos",
    noDiscTitle: "Quando descontos não são permitidos:",
    nd1: "Alta temporada e PIC (Jul–Ago, feriados, NYE)", nd2: "NET resultante abaixo do piso absoluto",
    nd3: "Calculados sobre o preço OTA — sempre usar o NET", nd4: "Sem autorização do nível correspondente",
    footerLeft: "Aldeia Jericoacoara · Confidencial · Uso Interno", footerRight: "Dados salvos automaticamente",
    months: ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"],
    wdays: ["D","S","T","Q","Q","S","S"],
    privNote: "→ Exemplo: Vila Lion, 3 quartos a R$900 → potencial = 6 × R$900 = R$5.400. Oferta abaixo disso deve ser recusada.",
    kiteNote: "★★ A temporada de kitesurf (Set–15 Nov) gerou R$536k em 2025 apenas com vilas. Não reduza preços antes de 15 de novembro.",
    gapNote: "Gap = período não reservado entre duas reservas confirmadas.",
    conceptEx: "Exemplo: NET R$3.500 → PIX: R$3.500 · Booking (16%): R$3.500 ÷ 0,84 = R$4.167 · Airbnb (18%): R$3.500 ÷ 0,82 = R$4.268",
    grpLabels: {A:"Grupo A — Vilas Premium", B:"Grupo B — Upper-Mid", C:"Grupo C — Suítes", D:"Grupo D — Apartamentos"},
    grpDescs: {A:"Lion & Panhard", B:"Niros & Ventana", C:"19 quartos", D:"7 unidades"},
    compCol: "Concorrente",
    compMonths: ["Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
    discAll: "Todos", discRestricted: "Restrito",
    discAuth1: "Daniele / Equipe Comercial", discAuth2: "Aprovação Débora", discAuth3: "Gestão (Débora + CB)",
    compLabels: {A:"Grupo A — Vilas Lion & Panhard (Booking.com 2026)", B:"Grupo B — Vilas Niros & Ventana (Booking.com 2026)", C:"Grupo C — Suítes (Booking.com 2026)", D:"Grupo D — Apartamentos (Booking.com 2026)"},
    compNotes: {A:"* Villa Mandi inclui serviços completos justificando preço superior.", B:"Preços por noite (vila completa).", C:"Superior = nível Master · Inferior = nível Deluxe.", D:"Produto raro — raridade justifica precificação confiante."},
    calcTitle: "Como é feito o cálculo do tarifário",
    calcMethod: "Anteriormente, o cálculo do tarifário era realizado com base nos valores praticados no ano anterior e na análise da concorrência. O novo tarifário foi desenvolvido a partir de um estudo mais aprofundado, considerando os custos operacionais, o levantamento do valor mínimo viável para comercialização de cada acomodação, além de uma nova análise comparativa de mercado e concorrentes. Com base nesses dados, análises e comparações, os novos valores foram definidos e sugeridos.",
    calcBooking: "Os valores apresentados na Booking.com podem variar de acordo com o perfil do hóspede e os descontos disponíveis na plataforma no momento da reserva. Os valores informados neste relatório correspondem às tarifas mínimas, considerando o cenário de maior desconto possível aplicado pela plataforma. Como exemplo, um hóspede Genius que realize a reserva pelo aplicativo celular — acumulando os descontos máximos disponíveis — visualizará e pagará a tarifa apresentada aqui. Por outro lado, hóspedes que não se enquadrem em todas as campanhas ou benefícios ativos poderão visualizar valores superiores. Por exemplo, um hóspede que realize a reserva pelo computador poderá pagar aproximadamente 5% a mais, devido à não aplicação do desconto exclusivo para reservas realizadas via dispositivo móvel.",
  },
  en: {
    subtitle: "Dynamic Rate Sheet · V1 2026/2027 · Confidential",
    saved: "✓ Saved", saving: "Saving...", resetBtn: "Reset", resetConfirm: "Confirm", resetCancel: "Cancel",
    t1: "Rate Table", t2: "Competitors", t3: "Calendar", t4: "Rules", t5: "Seasons & Channels", t6: "Discounts",
    rHint: "Click any dashed value to edit. Channel prices recalculate automatically.",
    floor: "NET Floor", minNights: "Min. Nights", net: "NET", direct: "PIX / Direct",
    disc: "Disc.", auth: "Authorization", group: "Group",
    compNote: "Source: Booking.com 2026.", compLegend: "Green = below Aldeia NET avg · Red = above.",
    visual: "Visual", editMode: "Edit",
    legend: "Legend:", holidayDot: "= holiday (hover to see)",
    rangesTitle: "Season Ranges", holidaysTitle: "Holidays & Special Dates",
    startCol: "Start", endCol: "End", seasonCol: "Season", descCol: "Description",
    dateCol: "Date", nameCol: "Name",
    addPeriod: "+ Add period", addHoliday: "+ Add holiday", addLine: "+ Add line",
    editHint: "Click any field to edit. Use the trash icon to remove and + Add for new rows.",
    dateHint: "Format: DD/MM/YY",
    calRefTitle: "Reference Calendar (Text)",
    period: "Period", dates: "Dates", obs: "Notes",
    minStayTitle: "Minimum Stays", villasCol: "Villas (A & B)", suitesCol: "Suites & Apts (C & D)",
    payTitle: "Payment Methods", methodCol: "Method", feeCol: "Fee", prioCol: "Priority", actionCol: "Action",
    gapTitle: "Gap Management", gapCol: "Gap", highCol: "High Season (HIGH/NYE)", lowCol: "Low / Mid Season (LOW/MID)",
    privTitle: "Privatization vs Room-by-Room", roomsCol: "Rooms reserved", requestCol: "Request", decisionCol: "Decision",
    conceptsTitle: "Fundamental Pricing Concepts",
    ruleGold: "Golden Rule: Discounts always calculated on NET — never on the published channel price. Discounting on OTA price only reduces channel margin.",
    seasonsTitle: "Seasons",
    seasonsHint: "Rename and/or change color. All tables and the visual calendar update in real time.",
    colorLabel: "Color:", channelsTitle: "Channels & Commissions",
    channelsHint: "Change commission and all published prices recalculate automatically.",
    chanCol: "Channel", commCol: "Commission", divCol: "Divisor", netRcvCol: "NET received", prioStars: "Priority",
    discAlert: "Discounts always calculated on NET — never on the published channel price.",
    levelCol: "Level", authCol: "Who authorizes", sitCol: "Typical situation", grpCol: "Groups",
    noDiscTitle: "When discounts are NOT allowed:",
    nd1: "High season and PIC (Jul–Ago, holidays, NYE)", nd2: "NET result below absolute floor",
    nd3: "Calculated on OTA price — always use NET as base", nd4: "Without corresponding level authorization",
    footerLeft: "Aldeia Jericoacoara · Confidential · Internal Use", footerRight: "Data saved automatically",
    months: ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"],
    wdays: ["S","M","T","W","T","F","S"],
    privNote: "→ Example: Vila Lion, 3 rooms at R$900 avg → potential = 6 × R$900 = R$5,400. Offers below R$5,400 NET should be refused.",
    kiteNote: "★★ The kitesurf season (Sep–Nov 15) generated R$536k in 2025 from villas alone. Do not reduce prices before November 15.",
    gapNote: "Gap = an unreserved period between two confirmed bookings.",
    conceptEx: "Example: NET R$3,500 → PIX: R$3,500 · Booking (16%): R$3,500 ÷ 0.84 = R$4,167 · Airbnb (18%): R$3,500 ÷ 0.82 = R$4,268",
    grpLabels: {A:"Group A — Premium Villas", B:"Group B — Upper-Mid Villas", C:"Group C — Suites", D:"Group D — Apartments"},
    grpDescs: {A:"Lion & Panhard", B:"Niros & Ventana", C:"19 rooms", D:"7 units"},
    compCol: "Competitor",
    compMonths: ["Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    discAll: "All", discRestricted: "Restricted",
    discAuth1: "Daniele / Sales Team", discAuth2: "Débora Approval", discAuth3: "Management (Débora + CB)",
    compLabels: {A:"Group A — Villas Lion & Panhard (Booking.com 2026)", B:"Group B — Villas Niros & Ventana (Booking.com 2026)", C:"Group C — Suites (Booking.com 2026)", D:"Group D — Apartments (Booking.com 2026)"},
    compNotes: {A:"* Villa Mandi includes full services (chef, staff) justifying higher price.", B:"Prices per night (full villa).", C:"Upper rows = Master/Balcony level · Lower = Deluxe level.", D:"Rare product — scarcity justifies confident pricing."},
    calcTitle: "How is the rate sheet calculated",
    calcMethod: "Previously, the rate sheet calculation was based on prices charged in the previous year and competitor analysis. The new rate sheet was developed from a more in-depth study, considering operational costs, the assessment of the minimum viable value for commercializing each accommodation, plus a new comparative market and competitor analysis. Based on this data, analyses and comparisons, the new values were defined and suggested.",
    calcBooking: "The values presented on Booking.com may vary according to the guest profile and discounts available on the platform at the time of booking. The values reported in this report correspond to minimum rates, considering the scenario of the highest possible discount applied by the platform. For example, a Genius guest who makes a booking through the mobile app will see and pay the rate presented here. On the other hand, guests who do not meet all active campaigns or benefits may see higher values. For example, a guest who makes a booking from a computer may pay approximately 5% more due to the non-application of the exclusive discount for mobile bookings.",
  },
};

const INIT = {
  seasons: [
    { id: "low", name: "LOW", p: "blue" }, { id: "mid", name: "MID", p: "amber" },
    { id: "high", name: "HIGH", p: "red" }, { id: "nye", name: "NYE", p: "purple" },
  ],
  channels: [
    { id: "com_pix", name: "Comercial PIX", comm: 5 },
    { id: "com_card", name: "Comercial Cartão", comm: 11.28, div: 0.8872 },
    { id: "bk", name: "Booking.com", comm: 18 }, { id: "ab", name: "Airbnb", comm: 18 },
    { id: "exp", name: "Expedia", comm: 16.5 }, { id: "ind", name: "Indicação (Agência)", comm: 10 },
  ],
  units: [
    { id: "lion", name: "Vila Lion", g: "A", floor: 3250, rows: [
      { s: "low", ms: "2 noites", net: 3500, disc: 0, auth: "Sem desconto" },
      { s: "mid", ms: "2–3 noites", net: 5000, disc: 0, auth: "Sem desconto" },
      { s: "high", ms: "4–5 noites", net: 7000, disc: 0, auth: "Consultar Débora" },
      { s: "nye", ms: "5–7 noites", net: 20000, disc: 0, auth: "Consultar CB" },
    ]},
    { id: "panhard", name: "Vila Panhard", g: "A", floor: 3000, rows: [
      { s: "low", ms: "2 noites", net: 3000, disc: 0, auth: "Sem desconto" },
      { s: "mid", ms: "2–3 noites", net: 4500, disc: 0, auth: "Sem desconto" },
      { s: "high", ms: "4–5 noites", net: 6000, disc: 0, auth: "Consultar Débora" },
      { s: "nye", ms: "5–7 noites", net: 16000, disc: 0, auth: "Consultar CB" },
    ]},
    { id: "niros", name: "Vila Niros", g: "B", floor: 2530, rows: [
      { s: "low", ms: "2 noites", net: 2750, disc: 10, auth: "Débora se >5%" },
      { s: "mid", ms: "2–3 noites", net: 3500, disc: 10, auth: "Débora se >5%" },
      { s: "high", ms: "4–5 noites", net: 4800, disc: 5, auth: "Débora" },
      { s: "nye", ms: "5–7 noites", net: 12000, disc: 0, auth: "Consultar CB" },
    ]},
    { id: "ventana", name: "Vila Ventana", g: "B", floor: 2070, rows: [
      { s: "low", ms: "2 noites", net: 2250, disc: 10, auth: "Débora se >5%" },
      { s: "mid", ms: "2–3 noites", net: 2800, disc: 10, auth: "Débora se >5%" },
      { s: "high", ms: "4–5 noites", net: 3850, disc: 5, auth: "Débora" },
      { s: "nye", ms: "5–7 noites", net: 9000, disc: 0, auth: "Consultar CB" },
    ]},
    { id: "master", name: "Suite Master", g: "C", floor: 563, qty: "5 qts", rows: [
      { s: "low", ms: "1–2 noites", net: 450, disc: 15, auth: "Daniele / Comercial" },
      { s: "mid", ms: "2 noites", net: 700, disc: 10, auth: "Daniele / Comercial" },
      { s: "high", ms: "3–4 noites", net: 820, disc: 5, auth: "Débora" },
      { s: "nye", ms: "3–5 noites", net: 2000, disc: 0, auth: "Sem desconto" },
    ]},
    { id: "mbal", name: "Master Balcony", g: "C", floor: 563, qty: "4 qts", rows: [
      { s: "low", ms: "1–2 noites", net: 500, disc: 15, auth: "Daniele / Comercial" },
      { s: "mid", ms: "2 noites", net: 780, disc: 10, auth: "Daniele / Comercial" },
      { s: "high", ms: "3–4 noites", net: 950, disc: 5, auth: "Débora" },
      { s: "nye", ms: "3–5 noites", net: 2200, disc: 0, auth: "Sem desconto" },
    ]},
    { id: "dlx", name: "Suite Deluxe", g: "C", floor: 563, qty: "4 qts", rows: [
      { s: "low", ms: "1–2 noites", net: 720, disc: 10, auth: "Daniele / Comercial" },
      { s: "mid", ms: "2 noites", net: 900, disc: 10, auth: "Débora se >5%" },
      { s: "high", ms: "3–4 noites", net: 1050, disc: 5, auth: "Débora" },
      { s: "nye", ms: "3–5 noites", net: 2500, disc: 0, auth: "Sem desconto" },
    ]},
    { id: "dbal", name: "Deluxe Balcony", g: "C", floor: 563, qty: "4 qts", rows: [
      { s: "low", ms: "1–2 noites", net: 800, disc: 10, auth: "Débora se >5%" },
      { s: "mid", ms: "2 noites", net: 980, disc: 10, auth: "Débora se >5%" },
      { s: "high", ms: "3–4 noites", net: 1150, disc: 5, auth: "Débora" },
      { s: "nye", ms: "3–5 noites", net: 2700, disc: 0, auth: "Sem desconto" },
    ]},
    { id: "gdlx", name: "Gran Deluxe", g: "C", floor: 563, qty: "2 qts", rows: [
      { s: "low", ms: "1–2 noites", net: 1000, disc: 10, auth: "Daniele / Comercial" },
      { s: "mid", ms: "2 noites", net: 1200, disc: 5, auth: "Débora" },
      { s: "high", ms: "3–4 noites", net: 1400, disc: 5, auth: "Débora" },
      { s: "nye", ms: "3–5 noites", net: 3200, disc: 0, auth: "Sem desconto" },
    ]},
    { id: "a2br", name: "Apartamento 2 Quartos", g: "D", floor: 1012, qty: "5 un.", rows: [
      { s: "low", ms: "1–2 noites", net: 750, disc: 15, auth: "Daniele / Comercial" },
      { s: "mid", ms: "2 noites", net: 900, disc: 10, auth: "Daniele / Comercial" },
      { s: "high", ms: "3–4 noites", net: 1250, disc: 5, auth: "Débora" },
      { s: "nye", ms: "3 noites", net: 2200, disc: 0, auth: "Sem desconto" },
    ]},
    { id: "a1br", name: "Apartamento 1 Quarto", g: "D", floor: 633, qty: "2 un.", rows: [
      { s: "low", ms: "1–2 noites", net: 600, disc: 15, auth: "Daniele / Comercial" },
      { s: "mid", ms: "2 noites", net: 700, disc: 10, auth: "Daniele / Comercial" },
      { s: "high", ms: "3–4 noites", net: 950, disc: 5, auth: "Débora" },
      { s: "nye", ms: "3 noites", net: 1600, disc: 0, auth: "Sem desconto" },
    ]},
  ],
  calendar: [
    { p: "Réveillon", d: "26 Dez 2026 → 2 Jan 2027", s: "nye", n: "Maior demanda do ano — sem teto de preço" },
    { p: "Verão Brasileiro", d: "3–31 Jan", s: "high", n: "Turismo doméstico, famílias" },
    { p: "Carnaval", d: "13–18 Fev", s: "high", n: "Evento nacional" },
    { p: "Pós-Carnaval", d: "19 Fev → 15 Mar", s: "low", n: "Temporada de chuvas" },
    { p: "Mar → meados Jun", d: "16 Mar → 14 Jun", s: "low", n: "Ombro estável" },
    { p: "Semana Santa", d: "2–5 Abr", s: "mid", n: "Feriado prolongado" },
    { p: "Tiradentes", d: "18–21 Abr", s: "mid", n: "Feriado prolongado" },
    { p: "Dia do Trabalho", d: "1–3 Mai", s: "mid", n: "Feriado prolongado" },
    { p: "Corpus Christi", d: "4–7 Jun", s: "mid", n: "Fim de semana prolongado" },
    { p: "Verão Europeu + Kite", d: "15 Jun → 31 Ago", s: "high", n: "Férias europeias + vento máximo" },
    { p: "Independência", d: "5–7 Set", s: "high", n: "Feriado nacional" },
    { p: "Kitesurf Estendido", d: "1 Set → 15 Nov", s: "high", n: "NÃO reduzir antes de 15 Nov" },
    { p: "N. Sra. Aparecida", d: "10–12 Out", s: "high", n: "Feriado nacional" },
    { p: "Finados", d: "31 Out → 2 Nov", s: "high", n: "Feriado prolongado" },
    { p: "Proclamação", d: "13–15 Nov", s: "high", n: "Feriado prolongado" },
    { p: "Pré-NYE tranquilo", d: "16 Nov → 15 Dez", s: "low", n: "Pausa antes do Réveillon" },
    { p: "Pré-NYE em alta", d: "16–25 Dez", s: "mid", n: "Demanda subindo" },
  ],
  minStay: [
    { sid: "low", villas: "2 noites", suites: "1–2 noites (preencher gaps)" },
    { sid: "mid", villas: "2–3 noites", suites: "2 noites" },
    { sid: "high", villas: "4–5 noites", suites: "3–4 noites" },
    { sid: "nye", villas: "5–7 noites (26 Dez–2 Jan)", suites: "5 noites" },
  ],
  payments: [
    { method: "PIX", fee: "0%", priority: "Maxima", action: "Oferecer 3–5% para incentivar (dentro do envelope 0–5% — não cumulativo)" },
    { method: "Cartão de crédito", fee: "~4%", priority: "Padrao", action: "Sem desconto adicional necessário" },
    { method: "Parcelado", fee: "4–6% total", priority: "Aceitavel", action: "Calcular o NET antes de aceitar" },
  ],
  gaps: [
    { gap: "1–2 noites", high: "Manter fechado — não aceitar estadias curtas que bloqueiem reserva maior", low: "Abrir + desconto ou Fique 3 = Pague 2" },
    { gap: "3 noites", high: "Proteger — abrir só se J-15 e sem reserva maior em vista", low: "Abrir livremente" },
    { gap: "4+ noites", high: "Vender normalmente à tarifa NET", low: "Vender normalmente à tarifa NET" },
  ],
  privRules: [
    { rooms: "0 quartos", request: "Recebida", decision: "Compare: NET privatização vs (todos quartos x NET suite). Aceite o maior total." },
    { rooms: "1–2 quartos", request: "Para toda a vila", decision: "Recusar — exceto se cobrir receita reservada + potencial restante." },
    { rooms: "3+ quartos", request: "Para toda a vila", decision: "Recusar. Venda individual quase sempre supera o preço de privatização." },
  ],
  seasonRanges: [
    { id: "26a", start: "2026-01-01", end: "2026-01-02", sid: "nye", label: "Réveillon (fim)" },
    { id: "26b", start: "2026-01-03", end: "2026-01-31", sid: "high", label: "Verão Brasileiro" },
    { id: "26c", start: "2026-02-01", end: "2026-02-12", sid: "low", label: "Baixa temporada" },
    { id: "26d", start: "2026-02-13", end: "2026-02-18", sid: "high", label: "Carnaval" },
    { id: "26e", start: "2026-02-19", end: "2026-03-15", sid: "low", label: "Pós-Carnaval" },
    { id: "26f", start: "2026-03-16", end: "2026-04-01", sid: "low", label: "Ombro estável" },
    { id: "26g", start: "2026-04-02", end: "2026-04-05", sid: "mid", label: "Semana Santa" },
    { id: "26h", start: "2026-04-06", end: "2026-04-17", sid: "low", label: "Ombro estável" },
    { id: "26i", start: "2026-04-18", end: "2026-04-21", sid: "mid", label: "Tiradentes" },
    { id: "26j", start: "2026-04-22", end: "2026-04-30", sid: "low", label: "Ombro estável" },
    { id: "26k", start: "2026-05-01", end: "2026-05-03", sid: "mid", label: "Dia do Trabalho" },
    { id: "26l", start: "2026-05-04", end: "2026-06-03", sid: "low", label: "Ombro estável" },
    { id: "26m", start: "2026-06-04", end: "2026-06-07", sid: "mid", label: "Corpus Christi" },
    { id: "26n", start: "2026-06-08", end: "2026-06-14", sid: "low", label: "Ombro estável" },
    { id: "26o", start: "2026-06-15", end: "2026-08-31", sid: "high", label: "Verão Europeu + Kitesurf" },
    { id: "26p", start: "2026-09-01", end: "2026-09-04", sid: "mid", label: "Kitesurf (início)" },
    { id: "26q", start: "2026-09-05", end: "2026-09-07", sid: "high", label: "Independência" },
    { id: "26r", start: "2026-09-08", end: "2026-11-15", sid: "high", label: "Kitesurf Estendido" },
    { id: "26s", start: "2026-11-16", end: "2026-12-15", sid: "low", label: "Pré-NYE tranquilo" },
    { id: "26t", start: "2026-12-16", end: "2026-12-25", sid: "mid", label: "Pré-NYE em alta" },
    { id: "26u", start: "2026-12-26", end: "2026-12-31", sid: "nye", label: "Réveillon" },
    { id: "27a", start: "2027-01-01", end: "2027-01-02", sid: "nye", label: "Réveillon (fim)" },
    { id: "27b", start: "2027-01-03", end: "2027-01-31", sid: "high", label: "Verão Brasileiro" },
    { id: "27c", start: "2027-02-01", end: "2027-02-04", sid: "low", label: "Baixa temporada" },
    { id: "27d", start: "2027-02-05", end: "2027-02-10", sid: "high", label: "Carnaval" },
    { id: "27e", start: "2027-02-11", end: "2027-03-15", sid: "low", label: "Pós-Carnaval" },
    { id: "27f", start: "2027-03-16", end: "2027-03-25", sid: "low", label: "Ombro estável" },
    { id: "27g", start: "2027-03-26", end: "2027-03-28", sid: "mid", label: "Semana Santa" },
    { id: "27h", start: "2027-03-29", end: "2027-04-20", sid: "low", label: "Ombro estável" },
    { id: "27i", start: "2027-04-21", end: "2027-04-21", sid: "mid", label: "Tiradentes" },
    { id: "27j", start: "2027-04-22", end: "2027-04-30", sid: "low", label: "Ombro estável" },
    { id: "27k", start: "2027-05-01", end: "2027-05-03", sid: "mid", label: "Dia do Trabalho" },
    { id: "27l", start: "2027-05-04", end: "2027-05-26", sid: "low", label: "Ombro estável" },
    { id: "27m", start: "2027-05-27", end: "2027-05-30", sid: "mid", label: "Corpus Christi" },
    { id: "27n", start: "2027-05-31", end: "2027-06-14", sid: "low", label: "Ombro estável" },
    { id: "27o", start: "2027-06-15", end: "2027-08-31", sid: "high", label: "Verão Europeu + Kitesurf" },
    { id: "27p", start: "2027-09-01", end: "2027-09-04", sid: "mid", label: "Kitesurf (início)" },
    { id: "27q", start: "2027-09-05", end: "2027-09-07", sid: "high", label: "Independência" },
    { id: "27r", start: "2027-09-08", end: "2027-11-15", sid: "high", label: "Kitesurf Estendido" },
    { id: "27s", start: "2027-11-16", end: "2027-12-15", sid: "low", label: "Pré-NYE tranquilo" },
    { id: "27t", start: "2027-12-16", end: "2027-12-25", sid: "mid", label: "Pré-NYE em alta" },
    { id: "27u", start: "2027-12-26", end: "2027-12-31", sid: "nye", label: "Réveillon" },
  ],
  holidays: [
    { date: "2026-01-01", label: "Ano Novo" },
    { date: "2026-02-13", label: "Carnaval" }, { date: "2026-02-14", label: "Carnaval" },
    { date: "2026-02-15", label: "Carnaval" }, { date: "2026-02-16", label: "Carnaval" },
    { date: "2026-02-17", label: "Carnaval" }, { date: "2026-02-18", label: "Quarta de Cinzas" },
    { date: "2026-04-03", label: "Sexta-feira Santa" }, { date: "2026-04-05", label: "Páscoa" },
    { date: "2026-04-21", label: "Tiradentes" }, { date: "2026-05-01", label: "Dia do Trabalho" },
    { date: "2026-06-04", label: "Corpus Christi" }, { date: "2026-09-07", label: "Independência" },
    { date: "2026-10-12", label: "N. Sra. Aparecida" }, { date: "2026-11-02", label: "Finados" },
    { date: "2026-11-15", label: "Proclamação da República" }, { date: "2026-11-20", label: "Consciência Negra" },
    { date: "2026-12-25", label: "Natal" },
    { date: "2026-12-26", label: "Réveillon" }, { date: "2026-12-31", label: "Véspera do Ano Novo" },
    { date: "2027-01-01", label: "Ano Novo" },
    { date: "2027-02-05", label: "Carnaval" }, { date: "2027-02-06", label: "Carnaval" },
    { date: "2027-02-07", label: "Carnaval" }, { date: "2027-02-08", label: "Carnaval" },
    { date: "2027-02-09", label: "Carnaval" }, { date: "2027-02-10", label: "Quarta de Cinzas" },
    { date: "2027-03-26", label: "Sexta-feira Santa" }, { date: "2027-03-28", label: "Páscoa" },
    { date: "2027-04-21", label: "Tiradentes" }, { date: "2027-05-01", label: "Dia do Trabalho" },
    { date: "2027-05-27", label: "Corpus Christi" }, { date: "2027-09-07", label: "Independência" },
    { date: "2027-10-12", label: "N. Sra. Aparecida" }, { date: "2027-11-02", label: "Finados" },
    { date: "2027-11-15", label: "Proclamação da República" }, { date: "2027-11-20", label: "Consciência Negra" },
    { date: "2027-12-25", label: "Natal" },
    { date: "2027-12-26", label: "Réveillon" }, { date: "2027-12-31", label: "Véspera do Ano Novo" },
  ],
  discountRules: [
    { level: "0–5%", authorizer: "Daniele / Equipe Comercial", situation: "Incentivo direto / conversão PIX", groups: "Todos", danger: false },
    { level: "5–10%", authorizer: "Aprovação Débora", situation: "Ajuste competitivo / última hora", groups: "Todos", danger: false },
    { level: "10–15%", authorizer: "Gestão (Débora + CB)", situation: "Baixa ocupação / parceria estratégica", groups: "B, C, D", danger: false },
    { level: "15–20%", authorizer: "Gestão (Débora + CB)", situation: "Friends & Family", groups: "Restrito", danger: false },
    { level: ">20%", authorizer: "NÃO PERMITIDO", situation: "CB ou Promo Fique 3=Pague 2", groups: "Via CB", danger: true },
  ],
  noDiscountRules: [
    "Alta temporada e PIC (Jul–Ago, feriados, NYE)",
    "NET resultante abaixo do piso absoluto",
    "Calculados sobre o preço OTA — sempre usar o NET",
    "Sem autorização do nível correspondente",
  ],
};

const STORAGE_KEY = "aldeia-v7";

type RateSheetData = {
  seasons?: typeof INIT.seasons;
  channels?: typeof INIT.channels;
  units?: typeof INIT.units;
  calendar?: typeof INIT.calendar;
  minStay?: typeof INIT.minStay;
  payments?: typeof INIT.payments;
  gaps?: typeof INIT.gaps;
  privRules?: typeof INIT.privRules;
  seasonRanges?: typeof INIT.seasonRanges;
  holidays?: typeof INIT.holidays;
  discountRules?: typeof INIT.discountRules;
  noDiscountRules?: typeof INIT.noDiscountRules;
  lang?: "pt" | "en";
};

const GROUPS = {
  A: { label: "Grupo A", desc: "Lion & Panhard", color: "#065F46" },
  B: { label: "Grupo B", desc: "Niros & Ventana", color: "#1E40AF" },
  C: { label: "Grupo C", desc: "Suítes", color: "#92400E" },
  D: { label: "Grupo D", desc: "Apartamentos", color: "#6B21A8" }
};

const COMPETITORS = {
  A: {
    label: "Grupo A — Vilas Lion & Panhard (Booking.com 2026)",
    note: "* Villa Mandi inclui serviços completos justificando preço superior.",
    rows: [
      { name: "Vila Alala Jeri", v: [2288, 1741, 1857, 2263, 3598, 3830, 3646, 3819, 3646, 3646] },
      { name: "Villa Odara", v: [2595, 2595, 2595, 2595, 6095, 6795, 6095, 3995, 3995, 5500] },
      { name: "Casa Jerian", v: [null, null, 6900, 6900, 7500, 8100, 6900, 6900, 6900, 6900] },
      { name: "Villa Florens", v: [null, null, 7500, 7500, null, 4986, 4986, 4986, 4986, 4986] },
      { name: "*Villa Mandi", v: [10400, 11600, 10530, 10530, 13500, 13500, 15720, 15720, 15720, 15720] },
    ]
  },
  B: {
    label: "Grupo B — Vilas Niros & Ventana (Booking.com 2026)",
    note: "Preços por noite (vila completa).",
    rows: [
      { name: "Villa Alegria – La Villa Grp", v: [5223, 5223, 5223, 5223, 8705, 8705, 6499, 5223, 5223, 5223] },
      { name: "Villa Messina Jeri", v: [2200, 1500, 1500, 1915, 3073, 3500, 2700, 2700, 2700, 2700] },
      { name: "Villa Luz do Mar", v: [2123, 2256, 2256, 2628, null, null, 3353, null, null, null] },
      { name: "Vila Jehol", v: [null, null, null, 2000, 4000, null, null, 4400, 4400, 5000] },
    ]
  },
  C: {
    label: "Grupo C — Suítes (Booking.com 2026)",
    note: "Superior = nível Master · Inferior = nível Deluxe.",
    rows: [
      { name: "Villa Mango Jeri (Master)", v: [null, 669, 713, 713, 968, 1320, null, null, null, null] },
      { name: "Villa Nautica (Master)", v: [648, 683, 648, 702, 918, 1026, 810, 810, 810, 810] },
      { name: "Café Jeri Hotel (Master)", v: [659, 726, 674, 726, 726, 1112, 978, 978, 978, 978] },
      { name: "Villa Tapi (Master)", v: [753, 753, 762, 782, 869, 1265, 975, 975, 975, 975] },
      { name: "Vila Kalango (Deluxe)", v: [1258, 1258, 1258, 1258, 2484, null, 2484, 2484, 2484, 2484] },
      { name: "Villa Florens (Deluxe)", v: [900, 900, 900, 1296, 1022, null, 900, 900, 900, 900] },
      { name: "*Villa Mandi (Deluxe)", v: [2600, 2900, 2633, 2633, 3375, null, 3930, 3930, 3930, 3930] },
    ]
  },
  D: {
    label: "Grupo D — Apartamentos (Booking.com 2026)",
    note: "Produto raro — raridade justifica precificação confiante.",
    rows: [
      { name: "CasaLô Hotel", v: [483, 483, 483, 483, 544, 877, null, null, 727, 727] },
      { name: "Blue Residence", v: [590, 590, 590, 590, 1089, 1089, null, null, null, null] },
    ]
  },
};

const fmtR = (n: number) => "R$ " + Math.round(n).toLocaleString("pt-BR");
const pubP = (net: number, comm: number, div?: number) => {
  if (comm >= 100) return 0;
  if (div !== undefined) return net / div;
  return net / (1 - comm / 100);
};

const p2 = (n: number) => n < 10 ? "0" + n : "" + n;
const isoToDisp = (iso: string) => {
  if (!iso || iso.length < 10) return iso;
  return iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(2, 4);
};
const isoToDate = (iso: string) => {
  if (!iso || iso.length < 10) return undefined;
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  const d = Number(iso.slice(8, 10));
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
};
const dateToIso = (date: Date) => {
  return date.getFullYear() + "-" + p2(date.getMonth() + 1) + "-" + p2(date.getDate());
};
const dispToIso = (disp: string) => {
  const p = disp.trim().split("/");
  if (p.length < 3) return disp;
  const d = p[0], m = p[1], y = p[2];
  const fy = y.length <= 2 ? "20" + (y.length < 2 ? "0" + y : y) : y;
  return fy + "-" + (m.length < 2 ? "0" + m : m) + "-" + (d.length < 2 ? "0" + d : d);
};

// Componente para Edição em Linha (Inline Edit)
interface ECProps {
  val: string | number;
  display?: string;
  onSave: (val: any) => void;
  type?: string;
  right?: boolean;
  bold?: boolean;
  color?: string;
  wide?: boolean;
}

function EC({ val, display, onSave, type, right, bold, color, wide }: ECProps) {
  const t = type || "text";
  const [ed, setEd] = useState(false);
  const [v, setV] = useState("");
  
  const save = () => {
    const nv = t === "number" ? (parseFloat(v) || 0) : v;
    if ("" + nv !== "" + val) onSave(nv);
    setEd(false);
  };

  if (ed) return (
    <input 
      autoFocus 
      type={t} 
      value={v} 
      onChange={(e) => setV(e.target.value)} 
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEd(false);
      }}
      className={`w-full ${wide ? 'min-w-[160px]' : 'min-w-[50px]'} text-xs px-2 py-1 border-2 border-emerald-600 rounded bg-white text-stone-900 outline-none shadow-inner`}
    />
  );

  return (
    <span 
      onClick={() => { setEd(true); setV("" + val); }} 
      title="Clique para editar"
      className={`cursor-pointer border-b border-dashed border-stone-300 hover:border-emerald-600 transition-colors ${right ? "text-right block" : "text-left inline-block"} ${bold ? "font-semibold" : "font-normal"}`}
      style={{ color: color || "inherit" }}
    >
      {display !== undefined ? display : val}
    </span>
  );
}

// Componente de Edição de Data
interface DateECProps {
  val: string;
  onSave: (val: string) => void;
  hint?: string;
}

function DateEC({ val, onSave, hint }: DateECProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = isoToDate(val);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Clique para escolher a data"
          className="inline-flex items-center gap-1.5 text-xs border-b border-dashed border-stone-300 hover:border-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <CalendarIcon className="w-3 h-3 text-stone-400" />
          {isoToDisp(val) || hint || "DD/MM/AA"}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0 border-stone-200 shadow-xl">
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate || new Date()}
          captionLayout="dropdown"
          startMonth={new Date(2025, 0)}
          endMonth={new Date(2028, 11)}
          onSelect={(date) => {
            if (!date) return;
            onSave(dateToIso(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

// Componente Seletor de Temporada
interface SeasonSelProps {
  val: string;
  seasons: any[];
  onSave: (val: string) => void;
}

function SeasonSel({ val, seasons, onSave }: SeasonSelProps) {
  const [ed, setEd] = useState(false);
  
  const gs = (id: string) => {
    const s = seasons.find((x) => x.id === id) || seasons[0];
    const p = PAL[s.p as keyof typeof PAL] || PAL.blue;
    return { name: s.name, bg: p[0], tx: p[1], bd: p[2] };
  };

  const s = gs(val);

  if (ed) return (
    <select 
      autoFocus 
      value={val}
      onChange={(e) => { onSave(e.target.value); setEd(false); }}
      onBlur={() => setEd(false)}
      className="text-xs px-2 py-1 border border-stone-300 rounded bg-white text-stone-900 outline-none shadow-sm"
    >
      {seasons.map((sx) => (
        <option key={sx.id} value={sx.id}>{sx.name}</option>
      ))}
    </select>
  );

  return (
    <span 
      onClick={() => setEd(true)} 
      title="Clique para alterar" 
      className="cursor-pointer inline-block"
    >
      <span 
        className="px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-transform hover:scale-105"
        style={{ background: s.bg, color: s.tx, borderColor: s.bd }}
      >
        {s.name}
      </span>
    </span>
  );
}

// Componente Seção Colapsável
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-6 border border-stone-200 rounded-xl overflow-hidden bg-stone-50/50 shadow-sm">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3 bg-stone-100/80 border-b border-stone-200 text-left hover:bg-stone-100 transition-colors"
      >
        <span className="text-emerald-700">{icon}</span>
        <span className="text-sm font-semibold text-stone-800">{title}</span>
        {open ? <ChevronUp className="ml-auto w-4 h-4 text-stone-400" /> : <ChevronDown className="ml-auto w-4 h-4 text-stone-400" />}
      </button>
      {open && <div className="p-5 bg-white">{children}</div>}
    </div>
  );
}

// Componentes de Botão Auxiliares
const BtnDel = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className="p-1.5 bg-red-50 border border-red-200 rounded-lg text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
  >
    <Trash className="w-3.5 h-3.5" />
  </button>
);

const BtnAdd = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button 
    onClick={onClick} 
    className="mt-3 px-4 py-2 border border-dashed border-stone-300 rounded-lg text-xs font-medium text-stone-600 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all flex items-center gap-2"
  >
    <Plus className="w-3.5 h-3.5" /> {label}
  </button>
);

// Componentes de Tabela Auxiliares
const TH = ({ t, r, w }: { t: string; r?: boolean; w?: string }) => (
  <th 
    className={`px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider bg-stone-50 border-b border-stone-200 ${r ? "text-right" : "text-left"}`}
    style={{ width: w || "auto" }}
  >
    {t}
  </th>
);

const TD = ({ children, r, light }: { children: React.ReactNode; r?: boolean; light?: boolean }) => (
  <td className={`px-4 py-3 border-b border-stone-100 text-xs ${r ? "text-right" : "text-left"} ${light ? "text-stone-400" : "text-stone-700"}`}>
    {children}
  </td>
);

// Componente do Mês no Calendário Visual
interface CalMonthProps {
  year: number;
  month: number;
  sRanges: any[];
  holidays: any[];
  seasons: any[];
  T: any;
}

function CalMonth({ year, month, sRanges, holidays, seasons, T }: CalMonthProps) {
  const p2l = (n: number) => n < 10 ? "0" + n : "" + n;
  
  const getS = (ds: string) => {
    for (let j = 0; j < sRanges.length; j++) {
      if (ds >= sRanges[j].start && ds <= sRanges[j].end) {
        return sRanges[j].sid;
      }
    }
    return null;
  };

  const getSty = (sid: string | null) => {
    if (!sid) return { name: "", bg: "#F9FAFB", tx: "#D1D5DB", bd: "#E5E7EB" };
    const s = seasons.find((x) => x.id === sid) || seasons[0];
    const p = PAL[s.p as keyof typeof PAL] || PAL.blue;
    return { name: s.name, bg: p[0], tx: p[1], bd: p[2] };
  };

  const dim = new Date(year, month + 1, 0).getDate();
  const fw = new Date(year, month, 1).getDay();
  const cells = [];

  for (let j = 0; j < fw; j++) {
    cells.push(<div key={"pad" + j} className="bg-stone-50/50" />);
  }

  for (let d = 1; d <= dim; d++) {
    const ds = year + "-" + p2l(month + 1) + "-" + p2l(d);
    const sid = getS(ds);
    const sty = getSty(sid);
    const hols = holidays.filter((h) => h.date === ds);
    const holTip = hols.map((h) => h.label).join(", ");
    const tip = sid ? (sty.name + (holTip ? " - " + holTip : "")) : (holTip || "");
    const hasHol = hols.length > 0;

    cells.push(
      <div 
        key={d} 
        title={tip}
        className="text-center text-[10px] py-1.5 rounded relative flex flex-col items-center justify-between min-h-[32px] border border-transparent hover:border-emerald-500 transition-colors"
        style={{ background: sty.bg, color: sty.tx }}
      >
        <span className={hasHol ? "font-bold underline decoration-dotted decoration-stone-500" : ""}>{d}</span>
        {hasHol && (
          <span 
            className="w-1.5 h-1.5 rounded-full mt-0.5 block" 
            style={{ background: sty.bd }} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="border border-stone-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="text-center font-bold text-xs mb-3 text-emerald-800 tracking-wider">{T.months[month]}</div>
      <div className="grid grid-cols-7 gap-1">
        {T.wdays.map((n: string, i: number) => (
          <div key={i} className="text-center text-[9px] font-bold text-stone-400 py-1">{n}</div>
        ))}
        {cells}
      </div>
    </div>
  );
}

// Componente Principal
export default function Home() {
  const [seasons, setSeasons] = useState(INIT.seasons);
  const [channels, setChannels] = useState(INIT.channels);
  const [units, setUnits] = useState(INIT.units);
  const [calendar, setCalendar] = useState(INIT.calendar);
  const [minStay, setMinStay] = useState(INIT.minStay);
  const [payments, setPayments] = useState(INIT.payments);
  const [gaps, setGaps] = useState(INIT.gaps);
  const [privRules, setPrivRules] = useState(INIT.privRules);
  const [seasonRanges, setSeasonRanges] = useState(INIT.seasonRanges);
  const [holidays, setHolidays] = useState(INIT.holidays);
  const [discountRules, setDiscountRules] = useState(INIT.discountRules);
  const [noDiscountRules, setNoDiscountRules] = useState(INIT.noDiscountRules);
  const [tab, setTab] = useState("rates");
  const [calYear, setCalYear] = useState(2026);
  const [calView, setCalView] = useState("visual");
  const [openG, setOpenG] = useState<Record<string, boolean>>({ A: true, B: true, C: true, D: true });
  const [saved, setSaved] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [lang, setLang] = useState<"pt" | "en">("pt");
  const [loaded, setLoaded] = useState(false);

  const T = I18N[lang];

  const applyData = (d: RateSheetData) => {
    if (d.seasons) setSeasons(d.seasons);
    if (d.channels) setChannels(d.channels);
    if (d.units) setUnits(d.units);
    if (d.calendar) setCalendar(d.calendar);
    if (d.minStay) setMinStay(d.minStay);
    if (d.payments) setPayments(d.payments);
    if (d.gaps) setGaps(d.gaps);
    if (d.privRules) setPrivRules(d.privRules);
    if (d.seasonRanges) setSeasonRanges(d.seasonRanges);
    if (d.holidays) setHolidays(d.holidays);
    if (d.discountRules) setDiscountRules(d.discountRules);
    if (d.noDiscountRules) setNoDiscountRules(d.noDiscountRules);
    if (d.lang) setLang(d.lang);
  };

  const readLocalBackup = () => {
    const r = localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) as RateSheetData : null;
  };

  const buildPayload = () => ({
    seasons, channels, units, calendar, minStay, payments, gaps, privRules, seasonRanges, holidays, discountRules, noDiscountRules, lang
  });

  // Carregar dados salvos no banco, com fallback para o backup local antigo
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const body = await loadRateSheetData() as { data?: RateSheetData | null };
        if (active && body.data) {
          applyData(body.data);
        } else if (active) {
          const backup = readLocalBackup();
          if (backup) applyData(backup);
        }
      } catch (e) {
        console.error("Erro ao ler dados do banco:", e);
        try {
          const backup = readLocalBackup();
          if (active && backup) applyData(backup);
        } catch (localError) {
          console.error("Erro ao ler backup local:", localError);
        }
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  // Salvar dados automaticamente no banco
  useEffect(() => {
    if (!loaded) return;

    setSaved(false);
    const t = setTimeout(() => {
      const payload = buildPayload();

      saveRateSheetData(payload)
        .then(() => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
          setSaved(true);
        })
        .catch((e) => {
          console.error("Erro ao salvar dados no banco:", e);
        });
    }, 900);
    return () => clearTimeout(t);
  }, [loaded, seasons, channels, units, calendar, minStay, payments, gaps, privRules, seasonRanges, holidays, discountRules, noDiscountRules, lang]);

  const gs = (id: string) => {
    const s = seasons.find((x) => x.id === id) || INIT.seasons[0];
    const p = PAL[s.p as keyof typeof PAL] || PAL.blue;
    return { name: s.name, bg: p[0], tx: p[1], bd: p[2] };
  };

  const gc = (id: string) => channels.find((x) => x.id === id);
  const co_pix = gc("com_pix") || { comm: 5 };
  const co_card = gc("com_card") || { comm: 11.28, div: 0.8872 };
  const bk = gc("bk") || { comm: 18 };
  const ab = gc("ab") || { comm: 18 };
  const exp = gc("exp") || { comm: 16.5 };
  const ind = gc("ind") || { comm: 10 };

  const updRow = (uid: string, ri: number, f: string, v: any) => {
    setUnits((us) => us.map((u) => u.id !== uid ? u : {
      ...u,
      rows: u.rows.map((r, i) => i !== ri ? r : { ...r, [f]: v })
    }));
  };

  const updUnit = (uid: string, field: string, value: any) => {
    setUnits((us) => us.map((u) => u.id !== uid ? u : { ...u, [field]: value }));
  };

  const updArr = (setter: any, i: number, field: string, val: any) => {
    setter((arr: any[]) => arr.map((r, idx) => idx !== i ? r : { ...r, [field]: val }));
  };

  const updScalarArr = (setter: any, i: number, val: any) => {
    setter((arr: any[]) => arr.map((r, idx) => idx !== i ? r : val));
  };

  const delArr = (setter: any, i: number) => {
    setter((arr: any[]) => arr.filter((_, idx) => idx !== i));
  };

  const Pill = ({ id, small }: { id: string; small?: boolean }) => {
    const s = gs(id);
    return (
      <span 
        className={`rounded-full font-semibold border text-center ${small ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'} inline-block`}
        style={{ background: s.bg, color: s.tx, borderColor: s.bd }}
      >
        {s.name}
      </span>
    );
  };

  const cmpColor = (v: number, gid: string) => {
    const nets = units.filter((u) => u.g === gid).flatMap((u) => u.rows.map((r) => r.net));
    const avg = nets.length ? nets.reduce((a, b) => a + b, 0) / nets.length : v;
    return v < avg * 0.8 ? "#16A34A" : v > avg * 1.2 ? "#DC2626" : "#374151";
  };

  const yearRanges = seasonRanges.filter((r) => r.start.startsWith("" + calYear) || r.end.startsWith("" + calYear));
  const yearHols = holidays.filter((h) => h.date.startsWith("" + calYear));

  const TABS = [
    { id: "rates", icon: <Building className="w-4 h-4" />, label: T.t1 },
    { id: "comp", icon: <Globe className="w-4 h-4" />, label: T.t2 },
    { id: "calendar", icon: <CalendarIcon className="w-4 h-4" />, label: T.t3 },
    { id: "rules", icon: <BookOpen className="w-4 h-4" />, label: T.t4 },
    { id: "cfg", icon: <Palette className="w-4 h-4" />, label: T.t5 },
    { id: "disc", icon: <Percent className="w-4 h-4" />, label: T.t6 },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D221E] pb-16 font-sans">
      
      {/* Hero Banner com Imagem Gerada */}
      <div className="relative h-[280px] w-full overflow-hidden shadow-md">
        <img 
          src="/assets/casa-lion-areas-externas.jpg" 
          alt="Casa Lion - Areas externas" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 md:left-12 md:right-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="p-1.5 bg-emerald-700 rounded-lg text-white">
                <Building className="w-5 h-5" />
              </span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-white drop-shadow-sm font-serif">
                ALDEIA JERICOACOARA
              </h1>
            </div>
            <p className="text-xs text-stone-200/90 font-medium tracking-wider pl-9">
              {T.subtitle}
            </p>
          </div>
          
          {/* Controles de Cabeçalho */}
          <div className="flex items-center gap-4 pl-9 md:pl-0">
            {/* Seletor de Idioma */}
            <div className="flex rounded-lg overflow-hidden border border-white/20 bg-white/10 backdrop-blur-sm">
              {["pt", "en"].map((l) => (
                <button 
                  key={l} 
                  onClick={() => setLang(l as "pt" | "en")}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${lang === l ? "bg-emerald-700 text-white" : "text-stone-200 hover:text-white hover:bg-white/5"}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Status de Salvo */}
            <span className={`text-xs font-semibold px-2 py-1 rounded-md backdrop-blur-sm bg-white/10 ${saved ? "text-emerald-400" : "text-stone-300"}`}>
              {saved ? T.saved : T.saving}
            </span>

            {/* Resetar */}
            {confirmReset ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setSeasons(INIT.seasons);
                    setChannels(INIT.channels);
                    setUnits(INIT.units);
                    setCalendar(INIT.calendar);
                    setMinStay(INIT.minStay);
                    setPayments(INIT.payments);
                    setGaps(INIT.gaps);
                    setPrivRules(INIT.privRules);
                    setSeasonRanges(INIT.seasonRanges);
                    setHolidays(INIT.holidays);
                    setDiscountRules(INIT.discountRules);
                    setNoDiscountRules(INIT.noDiscountRules);
                    setConfirmReset(false);
                  }}
                  className="text-xs text-white bg-red-600 hover:bg-red-700 font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  {T.resetConfirm}
                </button>
                <button 
                  onClick={() => setConfirmReset(false)}
                  className="text-xs text-stone-200 hover:text-white bg-stone-700/50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {T.resetCancel}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setConfirmReset(true)}
                className="text-xs text-stone-200 hover:text-white border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
              >
                {T.resetBtn}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Container Principal */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
        
        {/* Navegação de Abas */}
        <div className="flex gap-1 border-b border-stone-200 mb-8 overflow-x-auto pb-px scrollbar-none">
          {TABS.map((t) => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap transition-all ${tab === t.id ? "border-emerald-700 text-emerald-800 font-semibold bg-emerald-50/30" : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ TAB 1: TARIFÁRIO ══ */}
        {tab === "rates" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-stone-500 bg-stone-100/50 border border-stone-200/80 rounded-xl px-4 py-3 text-xs">
              <Info className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>{T.rHint}</span>
            </div>

            {/* Secao de Informacoes sobre Calculo do Tarifario */}
            <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="px-6 py-5 bg-stone-50 border-b border-stone-200">
                <h3 className="font-serif font-bold text-stone-800 text-lg">{T.calcTitle}</h3>
              </div>
              <div className="p-6 space-y-4 text-stone-700 text-sm leading-relaxed">
                <div>
                  <h4 className="font-semibold text-stone-800 mb-2">Metodologia de Calculo</h4>
                  <p>{T.calcMethod}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-stone-800 mb-2">Variacoes de Preco na Booking.com</h4>
                  <p>{T.calcBooking}</p>
                </div>
              </div>
            </div>
            
            {Object.entries(GROUPS).map(([gid, gi]) => {
              const gu = units.filter((u) => u.g === gid);
              return (
                <div key={gid} className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button 
                    onClick={() => setOpenG((o) => ({ ...o, [gid]: !o[gid] }))}
                    className="w-full flex items-center gap-3 px-5 py-3.5 bg-stone-50 border-b border-stone-200 text-left hover:bg-stone-100/70 transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: gi.color }} />
                    <span className="font-semibold text-sm" style={{ color: gi.color }}>
                      {T.grpLabels[gid as keyof typeof T.grpLabels]} — {T.grpDescs[gid as keyof typeof T.grpDescs]}
                    </span>
                    {openG[gid] ? <ChevronUp className="ml-auto w-4 h-4 text-stone-400" /> : <ChevronDown className="ml-auto w-4 h-4 text-stone-400" />}
                  </button>
                  
                  {openG[gid] && (
                    <div className="p-4 space-y-6">
                      {gu.map((unit) => (
                        <div key={unit.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-stone-800 text-sm md:text-base">{unit.name}</span>
                              {unit.qty && <span className="text-[10px] text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full font-medium">{unit.qty}</span>}
                            </div>
                            <span className="text-xs text-stone-500">
                              {T.floor}:{" "}
                              <EC
                                val={unit.floor}
                                display={fmtR(unit.floor)}
                                type="number"
                                onSave={(v) => updUnit(unit.id, "floor", v)}
                                bold
                                color="#dc2626"
                              />
                            </span>
                          </div>
                          
                          <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
                            <table className="w-full border-collapse min-w-[760px]">
                              <thead>
                                <tr>
                                  <TH t={T.seasonCol} />
                                  <TH t={T.minNights} />
                                  <TH t={T.net + " ✎"} r />
                                  <TH t={T.direct} r />
                                  <TH t={"Comercial PIX (" + co_pix.comm + "%)"} r />
                                  <TH t={"Comercial Cart (" + co_card.comm + "%)"} r />
                                  <TH t={"Booking (" + bk.comm + "%)"} r />
                                  <TH t={"Airbnb (" + ab.comm + "%)"} r />
                                  <TH t={"Expedia (" + exp.comm + "%)"} r />
                                  <TH t={"Indicação (" + ind.comm + "%)"} r />
                                  <TH t={T.disc + " ✎"} r />
                                  <TH t={T.auth + " ✎"} />
                                </tr>
                              </thead>
                              <tbody>
                                {unit.rows.map((row, ri) => (
                                  <tr key={ri} className={ri % 2 ? "bg-stone-50/40" : "bg-white"}>
                                    <TD><Pill id={row.s} /></TD>
                                    <TD>
                                      <EC val={row.ms} onSave={(v) => updRow(unit.id, ri, "ms", v)} color="#57534e" />
                                    </TD>
                                    <TD r>
                                      <EC val={row.net} display={fmtR(row.net)} type="number" onSave={(v) => updRow(unit.id, ri, "net", v)} right bold color="#047857" />
                                    </TD>
                                    <TD r>{fmtR(row.net)}</TD>
                                    <TD r>{fmtR(pubP(row.net, co_pix.comm))}</TD>
                                    <TD r>{fmtR(pubP(row.net, co_card.comm, (co_card as any).div))}</TD>
                                    <TD r>{fmtR(pubP(row.net, bk.comm))}</TD>
                                    <TD r>{fmtR(pubP(row.net, ab.comm))}</TD>
                                    <TD r>{fmtR(pubP(row.net, exp.comm))}</TD>
                                    <TD r>{fmtR(pubP(row.net, ind.comm))}</TD>
                                    <TD r>
                                      <EC val={row.disc} display={row.disc === 0 ? "—" : row.disc + "%"} type="number" onSave={(v) => updRow(unit.id, ri, "disc", v)} right color={row.disc === 0 ? "#a8a29e" : "#dc2626"} />
                                    </TD>
                                    <TD>
                                      <EC val={row.auth} onSave={(v) => updRow(unit.id, ri, "auth", v)} color="#57534e" />
                                    </TD>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ TAB 2: CONCORRENTES ══ */}
        {tab === "comp" && (
          <div className="space-y-6">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{T.compNote}</p>
                <p className="text-blue-700/90 mt-0.5">{T.compLegend}</p>
              </div>
            </div>
            
            {Object.entries(COMPETITORS).map(([gid, comp]) => (
              <div key={gid} className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="flex items-center gap-3 px-5 py-3.5 bg-stone-50 border-b border-stone-200">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: GROUPS[gid as keyof typeof GROUPS].color }} />
                  <span className="font-semibold text-sm" style={{ color: GROUPS[gid as keyof typeof GROUPS].color }}>
                    {T.compLabels[gid as keyof typeof T.compLabels]}
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[640px]">
                    <thead>
                      <tr className="bg-stone-50/50">
                        <th className="px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-left border-b border-stone-200">{T.compCol}</th>
                        {T.compMonths.map((m: string) => (
                          <th key={m} className="px-3 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-right border-b border-stone-200">{m}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comp.rows.map((row, ri) => (
                        <tr key={ri} className={ri % 2 ? "bg-stone-50/40" : "bg-white"}>
                          <td className={`px-4 py-3 border-b border-stone-100 text-xs text-stone-800 ${row.name.startsWith("*") ? "font-semibold text-emerald-800" : ""}`}>
                            {row.name}
                          </td>
                          {row.v.map((val, mi) => (
                            <td 
                              key={mi} 
                              className="px-3 py-3 border-b border-stone-100 text-xs text-right font-medium"
                              style={{ color: val ? cmpColor(val, gid) : "#d6d3d1" }}
                            >
                              {val ? fmtR(val) : "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {comp.note && (
                  <p className="text-[10px] text-stone-400 bg-stone-50/50 px-5 py-2.5 border-t border-stone-100 italic">
                    {comp.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══ TAB 3: CALENDÁRIO ══ */}
        {tab === "calendar" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-2">
                {[2026, 2027].map((y) => (
                  <button 
                    key={y} 
                    onClick={() => setCalYear(y)}
                    className={`px-5 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${calYear === y ? "bg-emerald-700 border-emerald-700 text-white" : "border-stone-200 text-stone-600 bg-white hover:bg-stone-50"}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2 self-start sm:self-auto">
                {[
                  { k: "visual", label: T.visual, icon: <CalendarIcon className="w-3.5 h-3.5" /> },
                  { k: "edit", label: T.editMode, icon: <Plus className="w-3.5 h-3.5" /> }
                ].map((btn) => (
                  <button 
                    key={btn.k} 
                    onClick={() => setCalView(btn.k)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all shadow-sm ${calView === btn.k ? "bg-emerald-50 border-emerald-700 text-emerald-800" : "border-stone-200 text-stone-500 bg-white hover:bg-stone-50"}`}
                  >
                    {btn.icon}
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legenda do Calendário */}
            <div className="flex flex-wrap items-center gap-3 bg-stone-100/50 border border-stone-200/80 rounded-xl px-4 py-3">
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mr-1">{T.legend}</span>
              {seasons.map((s) => {
                const p = PAL[s.p as keyof typeof PAL] || PAL.blue;
                return (
                  <span 
                    key={s.id} 
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                    style={{ background: p[0], color: p[1], borderColor: p[2] }}
                  >
                    {s.name}
                  </span>
                );
              })}
              <span className="text-[10px] text-stone-500 flex items-center gap-1.5 ml-auto">
                <span className="inline-block w-2 h-2 rounded-full bg-stone-400" />
                {T.holidayDot}
              </span>
            </div>

            {/* Calendário Visual */}
            {calView === "visual" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }, (_, m) => (
                  <CalMonth key={m} year={calYear} month={m} sRanges={yearRanges} holidays={yearHols} seasons={seasons} T={T} />
                ))}
              </div>
            )}

            {/* Edição de Faixas / Feriados */}
            {calView === "edit" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-stone-500 bg-stone-100/50 border border-stone-200/80 rounded-xl px-4 py-3 text-xs">
                  <Info className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>{T.editHint}</span>
                </div>

                <Section title={`${T.rangesTitle} — ${calYear}`} icon={<Palette className="w-4 h-4" />}>
                  <p className="text-xs text-stone-400 mb-3">{T.dateHint}</p>
                  <div className="overflow-x-auto rounded-xl border border-stone-200">
                    <table className="w-full border-collapse min-w-[500px]">
                      <thead>
                        <tr>
                          <TH t={T.startCol} w="110px" />
                          <TH t={T.endCol} w="110px" />
                          <TH t={T.seasonCol} w="110px" />
                          <TH t={T.descCol} />
                          <TH t="" w="48px" />
                        </tr>
                      </thead>
                      <tbody>
                        {seasonRanges.filter((r) => r.start.startsWith("" + calYear)).map((row) => {
                          const gi = seasonRanges.findIndex((x) => x.id === row.id);
                          return (
                            <tr key={row.id} className={gi % 2 ? "bg-stone-50/40" : "bg-white"}>
                              <TD>
                                <DateEC val={row.start} onSave={(v) => updArr(setSeasonRanges, gi, "start", v)} hint={T.dateHint} />
                              </TD>
                              <TD>
                                <DateEC val={row.end} onSave={(v) => updArr(setSeasonRanges, gi, "end", v)} hint={T.dateHint} />
                              </TD>
                              <TD>
                                <SeasonSel val={row.sid} seasons={seasons} onSave={(v) => updArr(setSeasonRanges, gi, "sid", v)} />
                              </TD>
                              <TD light>
                                <EC
                                  val={row.label}
                                  display={row.label || "Adicionar descrição"}
                                  onSave={(v) => updArr(setSeasonRanges, gi, "label", v)}
                                  wide
                                  color={row.label ? "#57534e" : "#a8a29e"}
                                />
                              </TD>
                              <TD>
                                <BtnDel onClick={() => delArr(setSeasonRanges, gi)} />
                              </TD>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <BtnAdd 
                    onClick={() => setSeasonRanges((a) => a.concat([{ id: "new-" + Date.now(), start: `${calYear}-01-01`, end: `${calYear}-01-07`, sid: "low", label: "" }]))} 
                    label={`${T.addPeriod} ${calYear}`} 
                  />
                </Section>

                <Section title={`${T.holidaysTitle} — ${calYear}`} icon={<Ban className="w-4 h-4" />}>
                  <p className="text-xs text-stone-400 mb-3">{T.dateHint}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {holidays.filter((h) => h.date.startsWith("" + calYear)).map((row) => {
                      const gi = holidays.findIndex((x) => x.date === row.date && x.label === row.label);
                      return (
                        <div key={gi} className="flex gap-3 items-center px-4 py-3 border border-stone-200 rounded-xl bg-stone-50/30 shadow-sm">
                          <DateEC val={row.date} onSave={(v) => updArr(setHolidays, gi, "date", v)} hint={T.dateHint} />
                          <div className="flex-1">
                            <EC
                              val={row.label}
                              display={row.label || "Adicionar descrição"}
                              onSave={(v) => updArr(setHolidays, gi, "label", v)}
                              wide
                              color={row.label ? "#2D221E" : "#a8a29e"}
                            />
                          </div>
                          <BtnDel onClick={() => delArr(setHolidays, gi)} />
                        </div>
                      );
                    })}
                  </div>
                  <BtnAdd 
                    onClick={() => setHolidays((a) => a.concat([{ date: `${calYear}-01-01`, label: "" }]))} 
                    label={`${T.addHoliday} ${calYear}`} 
                  />
                </Section>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 4: REGRAS ══ */}
        {tab === "rules" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-stone-500 bg-stone-100/50 border border-stone-200/80 rounded-xl px-4 py-3 text-xs">
              <Info className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>{T.editHint}</span>
            </div>

            {/* Calendário de Referência (Texto) */}
            <Section title={T.calRefTitle} icon={<CalendarIcon className="w-4 h-4" />}>
              <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
                <table className="w-full border-collapse min-w-[520px]">
                  <thead>
                    <tr>
                      <TH t={T.period} w="160px" />
                      <TH t={T.dates} w="170px" />
                      <TH t={T.seasonCol} w="110px" />
                      <TH t={T.obs} />
                      <TH t="" w="48px" />
                    </tr>
                  </thead>
                  <tbody>
                    {calendar.map((row, i) => (
                      <tr key={i} className={i % 2 ? "bg-stone-50/40" : "bg-white"}>
                        <TD>
                          <EC val={row.p} onSave={(v) => updArr(setCalendar, i, "p", v)} wide bold />
                        </TD>
                        <TD light>
                          <EC val={row.d} onSave={(v) => updArr(setCalendar, i, "d", v)} wide />
                        </TD>
                        <TD>
                          <SeasonSel val={row.s} seasons={seasons} onSave={(v) => updArr(setCalendar, i, "s", v)} />
                        </TD>
                        <TD light>
                          <EC val={row.n} onSave={(v) => updArr(setCalendar, i, "n", v)} wide />
                        </TD>
                        <TD>
                          <BtnDel onClick={() => delArr(setCalendar, i)} />
                        </TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <BtnAdd onClick={() => setCalendar((c) => c.concat([{ p: "Novo período", d: "", s: "low", n: "" }]))} label={T.addLine} />
            </Section>

            {/* Estadias Mínimas */}
            <Section title={T.minStayTitle} icon={<Moon className="w-4 h-4" />}>
              <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <TH t={T.seasonCol} w="120px" />
                      <TH t={T.villasCol} />
                      <TH t={T.suitesCol} />
                      <TH t="" w="48px" />
                    </tr>
                  </thead>
                  <tbody>
                    {minStay.map((row, i) => (
                      <tr key={i} className={i % 2 ? "bg-stone-50/40" : "bg-white"}>
                        <TD>
                          <SeasonSel val={row.sid} seasons={seasons} onSave={(v) => updArr(setMinStay, i, "sid", v)} />
                        </TD>
                        <TD>
                          <EC val={row.villas} onSave={(v) => updArr(setMinStay, i, "villas", v)} wide />
                        </TD>
                        <TD>
                          <EC val={row.suites} onSave={(v) => updArr(setMinStay, i, "suites", v)} wide />
                        </TD>
                        <TD>
                          <BtnDel onClick={() => delArr(setMinStay, i)} />
                        </TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <BtnAdd onClick={() => setMinStay((a) => a.concat([{ sid: "low", villas: "", suites: "" }]))} label={T.addLine} />
            </Section>

            {/* Métodos de Pagamento */}
            <Section title={T.payTitle} icon={<CreditCard className="w-4 h-4" />} defaultOpen={false}>
              <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
                <table className="w-full border-collapse min-w-[480px]">
                  <thead>
                    <tr>
                      <TH t={T.methodCol} w="150px" />
                      <TH t={T.feeCol} w="80px" />
                      <TH t={T.prioCol} w="120px" />
                      <TH t={T.actionCol} />
                      <TH t="" w="48px" />
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((row, i) => (
                      <tr key={i} className={i % 2 ? "bg-stone-50/40" : "bg-white"}>
                        <TD>
                          <EC val={row.method} onSave={(v) => updArr(setPayments, i, "method", v)} bold />
                        </TD>
                        <TD>
                          <EC val={row.fee} onSave={(v) => updArr(setPayments, i, "fee", v)} color="#78716c" />
                        </TD>
                        <TD light>
                          <EC val={row.priority} onSave={(v) => updArr(setPayments, i, "priority", v)} />
                        </TD>
                        <TD light>
                          <EC val={row.action} onSave={(v) => updArr(setPayments, i, "action", v)} wide />
                        </TD>
                        <TD>
                          <BtnDel onClick={() => delArr(setPayments, i)} />
                        </TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <BtnAdd onClick={() => setPayments((a) => a.concat([{ method: "", fee: "", priority: "", action: "" }]))} label={T.addLine} />
            </Section>

            {/* Gestão de Gaps */}
            <Section title={T.gapTitle} icon={<CalendarX className="w-4 h-4" />} defaultOpen={false}>
              <p className="text-xs text-stone-500 mb-3 bg-amber-50 border border-amber-100 rounded-lg p-3">{T.gapNote}</p>
              <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
                <table className="w-full border-collapse min-w-[480px]">
                  <thead>
                    <tr>
                      <TH t={T.gapCol} w="100px" />
                      <TH t={T.highCol} />
                      <TH t={T.lowCol} />
                      <TH t="" w="48px" />
                    </tr>
                  </thead>
                  <tbody>
                    {gaps.map((row, i) => (
                      <tr key={i} className={i % 2 ? "bg-stone-50/40" : "bg-white"}>
                        <TD>
                          <EC val={row.gap} onSave={(v) => updArr(setGaps, i, "gap", v)} bold />
                        </TD>
                        <TD>
                          <EC val={row.high} onSave={(v) => updArr(setGaps, i, "high", v)} wide />
                        </TD>
                        <TD>
                          <EC val={row.low} onSave={(v) => updArr(setGaps, i, "low", v)} wide />
                        </TD>
                        <TD>
                          <BtnDel onClick={() => delArr(setGaps, i)} />
                        </TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <BtnAdd onClick={() => setGaps((a) => a.concat([{ gap: "", high: "", low: "" }]))} label={T.addLine} />
            </Section>

            {/* Privatização */}
            <Section title={T.privTitle} icon={<HomeIcon className="w-4 h-4" />} defaultOpen={false}>
              <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
                <table className="w-full border-collapse min-w-[480px]">
                  <thead>
                    <tr>
                      <TH t={T.roomsCol} w="150px" />
                      <TH t={T.requestCol} w="130px" />
                      <TH t={T.decisionCol} />
                      <TH t="" w="48px" />
                    </tr>
                  </thead>
                  <tbody>
                    {privRules.map((row, i) => (
                      <tr key={i} className={i % 2 ? "bg-stone-50/40" : "bg-white"}>
                        <TD>
                          <EC val={row.rooms} onSave={(v) => updArr(setPrivRules, i, "rooms", v)} bold />
                        </TD>
                        <TD light>
                          <EC val={row.request} onSave={(v) => updArr(setPrivRules, i, "request", v)} />
                        </TD>
                        <TD>
                          <EC val={row.decision} onSave={(v) => updArr(setPrivRules, i, "decision", v)} wide />
                        </TD>
                        <TD>
                          <BtnDel onClick={() => delArr(setPrivRules, i)} />
                        </TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <BtnAdd onClick={() => setPrivRules((a) => a.concat([{ rooms: "", request: "", decision: "" }]))} label={T.addLine} />
              <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">{T.privNote}</div>
            </Section>

            {/* Conceitos Fundamentais */}
            <Section title={T.conceptsTitle} icon={<DollarSign className="w-4 h-4" />} defaultOpen={false}>
              <div className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900 font-medium leading-relaxed">
                <strong>{T.ruleGold}</strong>
              </div>
              <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-emerald-50/50">
                      {[lang === "pt" ? "Conceito" : "Concept", lang === "pt" ? "Definição" : "Definition", lang === "pt" ? "Cálculo" : "Formula", lang === "pt" ? "Regra" : "Rule"].map((h, i) => (
                        <th key={i} className="px-4 py-3 text-[10px] font-bold text-emerald-800 uppercase tracking-wider border-b border-emerald-100 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 font-bold text-xs text-emerald-800 border-b border-stone-100">NET</td>
                      <td className="px-4 py-3 text-xs text-stone-600 border-b border-stone-100">{lang === "pt" ? "Valor efetivamente recebido após todas as deduções. Inclui buffer de segurança sobre o custo operacional." : "Value actually received after all deductions. Includes safety buffer over operational cost."}</td>
                      <td className="px-4 py-3 text-xs text-stone-600 border-b border-stone-100 font-medium">Piso + buffer</td>
                      <td className="px-4 py-3 text-xs text-stone-600 border-b border-stone-100">{lang === "pt" ? "Uso interno. Base de todos os descontos." : "Internal use. Base for all discounts."}</td>
                    </tr>
                    <tr className="bg-stone-50/30">
                      <td className="px-4 py-3 font-bold text-xs text-blue-800 border-b border-stone-100">Preço Público</td>
                      <td className="px-4 py-3 text-xs text-stone-600 border-b border-stone-100">{lang === "pt" ? "Preço exibido ao cliente em cada canal. Calculado a partir do NET." : "Price shown to the client per channel. Calculated from NET."}</td>
                      <td className="px-4 py-3 text-xs text-blue-800 border-b border-stone-100 font-bold">NET ÷ (1 – commission%)</td>
                      <td className="px-4 py-3 text-xs text-stone-600 border-b border-stone-100">{lang === "pt" ? "Visível ao cliente. Varia por canal." : "Visible to client. Varies by channel."}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-stone-500 mt-4 leading-relaxed italic">{T.conceptEx}</p>
            </Section>
          </div>
        )}

        {/* ══ TAB 5: TEMPORADAS & CANAIS ══ */}
        {tab === "cfg" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-bold text-stone-800 mb-1 font-serif">{T.seasonsTitle}</h3>
              <p className="text-xs text-stone-500 mb-4">{T.seasonsHint}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {seasons.map((s) => {
                  const p = PAL[s.p as keyof typeof PAL] || PAL.blue;
                  return (
                    <div key={s.id} className="border border-stone-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-bold border min-w-[64px] text-center shadow-sm"
                          style={{ background: p[0], color: p[1], borderColor: p[2] }}
                        >
                          {s.name}
                        </span>
                        <input 
                          value={s.name} 
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase();
                            setSeasons((ss) => ss.map((x) => x.id === s.id ? { ...x, name: v } : x));
                          }}
                          className="flex-1 text-xs px-3 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-900 font-semibold outline-none focus:border-emerald-600 shadow-inner"
                        />
                      </div>
                      
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">{T.colorLabel}</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(PAL).map(([k, vals]) => (
                          <button 
                            key={k} 
                            onClick={() => setSeasons((ss) => ss.map((x) => x.id === s.id ? { ...x, p: k } : x))} 
                            title={k}
                            className={`w-6 h-6 rounded-full transition-all shadow-sm ${s.p === k ? "scale-110 ring-2 ring-emerald-600 ring-offset-2" : "hover:scale-105"}`}
                            style={{ background: vals[0], border: `1.5px solid ${vals[2]}` }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-800 mb-1 font-serif">{T.channelsTitle}</h3>
              <p className="text-xs text-stone-500 mb-4">{T.channelsHint}</p>
              
              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-stone-50/50">
                      <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-left border-b border-stone-200">{T.chanCol}</th>
                      <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-right border-b border-stone-200">{T.commCol}</th>
                      <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-right border-b border-stone-200">Divisor Custom.</th>
                      <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-right border-b border-stone-200">{T.divCol}</th>
                      <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-right border-b border-stone-200">{T.netRcvCol}</th>
                      <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-right border-b border-stone-200">{T.prioStars}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map((ch, ci) => (
                      <tr key={ch.id} className={ci % 2 ? "bg-stone-50/40" : "bg-white"}>
                        <td className="px-5 py-4 border-b border-stone-100 font-semibold text-stone-800 text-xs md:text-sm">{ch.name}</td>
                        <td className="px-5 py-4 border-b border-stone-100">
                          <div className="flex items-center justify-end gap-1.5">
                            <input 
                              type="number" 
                              min={0} 
                              max={50} 
                              step={0.5} 
                              value={ch.comm}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value) || 0;
                                setChannels((cs) => cs.map((c, i) => i === ci ? { ...c, comm: v } : c));
                              }}
                              className="w-16 text-xs px-2.5 py-1.5 text-right border border-stone-300 rounded-lg bg-white text-stone-900 outline-none focus:border-emerald-600 shadow-inner"
                            />
                            <span className="text-xs text-stone-400 font-semibold">%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 border-b border-stone-100">
                          <div className="flex items-center justify-end gap-1.5">
                            <input 
                              type="number" 
                              min={0.5} 
                              max={1} 
                              step={0.0001} 
                              value={(ch as any).div || (1 - ch.comm / 100).toFixed(4)}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value) || (1 - ch.comm / 100);
                                setChannels((cs) => cs.map((c, i) => i === ci ? { ...c, div: v } as any : c));
                              }}
                              className="w-20 text-xs px-2.5 py-1.5 text-right border border-stone-300 rounded-lg bg-white text-stone-900 outline-none focus:border-emerald-600 shadow-inner"
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4 border-b border-stone-100 text-right text-xs text-stone-500 font-medium">{(1 - ch.comm / 100).toFixed(4)}</td>
                        <td className="px-5 py-4 border-b border-stone-100 text-right text-xs md:text-sm font-bold text-emerald-600">{Math.round((1 - ch.comm / 100) * 100)}%</td>
                        <td className="px-5 py-4 border-b border-stone-100 text-right text-xs md:text-sm text-amber-500 font-bold">{"★".repeat(ch.comm === 0 ? 5 : ch.comm <= 5 ? 4 : ch.comm <= 15 ? 3 : 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 6: DESCONTOS ══ */}
        {tab === "disc" && (
          <div className="space-y-6">
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{T.discAlert}</span>
            </div>

            <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-stone-50/50">
                    <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-left border-b border-stone-200">{T.levelCol}</th>
                    <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-left border-b border-stone-200">{T.authCol}</th>
                    <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-left border-b border-stone-200">{T.sitCol}</th>
                    <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-right border-b border-stone-200">{T.grpCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {discountRules.map((row, i) => {
                    const d = row.danger;
                    return (
                      <tr key={i} className={d ? "bg-red-50/40" : i % 2 ? "bg-stone-50/40" : "bg-white"}>
                        <td className={`px-5 py-3.5 border-b border-stone-100 font-bold text-xs md:text-sm ${d ? "text-red-700" : "text-stone-800"}`}>
                          <EC val={row.level} onSave={(v) => updArr(setDiscountRules, i, "level", v)} bold color={d ? "#b91c1c" : "#292524"} />
                        </td>
                        <td className={`px-5 py-3.5 border-b border-stone-100 text-xs md:text-sm ${d ? "text-red-600 font-semibold" : "text-stone-700"}`}>
                          <EC val={row.authorizer} onSave={(v) => updArr(setDiscountRules, i, "authorizer", v)} wide bold={d} color={d ? "#dc2626" : "#44403c"} />
                        </td>
                        <td className="px-5 py-3.5 border-b border-stone-100 text-xs text-stone-500">
                          <EC val={row.situation} onSave={(v) => updArr(setDiscountRules, i, "situation", v)} wide color="#57534e" />
                        </td>
                        <td className="px-5 py-3.5 border-b border-stone-100 text-xs text-stone-500 text-right">
                          <EC val={row.groups} onSave={(v) => updArr(setDiscountRules, i, "groups", v)} right color="#57534e" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="hidden border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-stone-50/50">
                    <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-left border-b border-stone-200">{T.levelCol}</th>
                    <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-left border-b border-stone-200">{T.authCol}</th>
                    <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-left border-b border-stone-200">{T.sitCol}</th>
                    <th className="px-5 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider text-right border-b border-stone-200">{T.grpCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["0–5%", T.discAuth1, lang === "pt" ? "Incentivo direto / conversão PIX" : "Direct incentive / PIX conversion", T.discAll, false],
                    ["5–10%", T.discAuth2, lang === "pt" ? "Ajuste competitivo / última hora" : "Competitive adjustment / last minute", T.discAll, false],
                    ["10–15%", T.discAuth3, lang === "pt" ? "Baixa ocupação / parceria estratégica" : "Low occupancy / strategic partnership", "B, C, D", false],
                    ["15–20%", T.discAuth3, "Friends & Family", T.discRestricted, false],
                    [">20%", lang === "pt" ? "NÃO PERMITIDO" : "NOT ALLOWED", lang === "pt" ? "CB ou Promo Fique 3=Pague 2" : "CB or Stay 3=Pay 2 promo", "Via CB", true],
                  ].map((row, i) => {
                    const [l, w, s, g, d] = row as [string, string, string, string, boolean];
                    return (
                      <tr key={i} className={d ? "bg-red-50/40" : i % 2 ? "bg-stone-50/40" : "bg-white"}>
                        <td className={`px-5 py-3.5 border-b border-stone-100 font-bold text-xs md:text-sm ${d ? "text-red-700" : "text-stone-800"}`}>{l}</td>
                        <td className={`px-5 py-3.5 border-b border-stone-100 text-xs md:text-sm ${d ? "text-red-600 font-semibold" : "text-stone-700"}`}>{w}</td>
                        <td className="px-5 py-3.5 border-b border-stone-100 text-xs text-stone-500">{s}</td>
                        <td className="px-5 py-3.5 border-b border-stone-100 text-xs text-stone-500 text-right">{g}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-stone-100/60 border border-stone-200 rounded-xl p-5">
              <p className="text-xs md:text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-600" />
                {T.noDiscTitle}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {noDiscountRules.map((txt, i) => (
                  <div key={i} className="flex gap-2.5 items-start bg-white/50 border border-stone-200/50 rounded-lg p-3">
                    <span className="text-red-600 font-bold text-sm leading-none">•</span>
                    <span className="text-xs text-stone-600 leading-relaxed">
                      <EC val={txt} onSave={(v) => updScalarArr(setNoDiscountRules, i, v)} wide color="#57534e" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden bg-stone-100/60 border border-stone-200 rounded-xl p-5">
              <p className="text-xs md:text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-600" />
                {T.noDiscTitle}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[T.nd1, T.nd2, T.nd3, T.nd4].map((txt, i) => (
                  <div key={i} className="flex gap-2.5 items-start bg-white/50 border border-stone-200/50 rounded-lg p-3">
                    <span className="text-red-600 font-bold text-sm leading-none">•</span>
                    <span className="text-xs text-stone-600 leading-relaxed">{txt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-12 pt-6 border-t border-stone-200 text-[10px] text-stone-400 flex flex-col sm:flex-row justify-between gap-2 tracking-wider">
          <span>{T.footerLeft}</span>
          <span>{T.footerRight}</span>
        </div>
      </div>
    </div>
  );
}
