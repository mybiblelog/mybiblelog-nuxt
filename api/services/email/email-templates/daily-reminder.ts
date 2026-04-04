import { LocaleCode } from '@shared/dist/i18n';
import renderBrandedEmail from './branded-wrapper';

const translations = {
  de: {
    my_bible_log: 'My Bible Log',
    this_is_your_reminder: 'Dies ist Ihr täglicher Erinnerungs-E-Mail von My Bible Log.',
    you_can_update_preferences: (settingsLink) => `Sie können Ihre Erinnerungseinstellungen <a href="${settingsLink}">hier</a> aktualisieren.`,
    open_my_bible_log: 'My Bible Log öffnen',
    most_recent_log_entries: 'Letzte Einträge im Journal',
    no_log_entries_found: 'Keine Einträge im Journal gefunden. Zeit, loszulegen!',
    date: 'Datum',
    passage: 'Passage',
    unsubscribe: 'Abonnement abbestellen',
  },
  en: {
    my_bible_log: 'My Bible Log',
    this_is_your_reminder: 'This is your daily reminder email from My Bible Log.',
    you_can_update_preferences: (settingsLink) => `You can update your reminder preferences <a href="${settingsLink}">here</a>.`,
    open_my_bible_log: 'Open My Bible Log',
    most_recent_log_entries: 'Most Recent Log Entries',
    no_log_entries_found: 'No log entries found. Time to start reading!',
    date: 'Date',
    passage: 'Passage',
    unsubscribe: 'Unsubscribe',
  },
  es: {
    my_bible_log: 'My Bible Log',
    this_is_your_reminder: 'Este es tu correo electrónico de recordatorio diario de My Bible Log.',
    you_can_update_preferences: (settingsLink) => `Puedes actualizar tus preferencias de recordatorio <a href="${settingsLink}">aquí</a>.`,
    open_my_bible_log: 'Abrir My Bible Log',
    most_recent_log_entries: 'Entradas más recientes del registro',
    no_log_entries_found: 'No se encontraron entradas en el registro. ¡Tiempo de empezar a leer!',
    date: 'Fecha',
    passage: 'Pasaje',
    unsubscribe: 'Cancelar suscripción',
  },
  ko: {
    my_bible_log: 'My Bible Log',
    this_is_your_reminder: 'My Bible Log에서 보내는 매일 알림 메일입니다.',
    you_can_update_preferences: (settingsLink) => `알림 설정은 <a href="${settingsLink}">여기</a>에서 바꿀 수 있습니다.`,
    open_my_bible_log: 'My Bible Log 열기',
    most_recent_log_entries: '최근 읽기 기록',
    no_log_entries_found: '기록이 없습니다. 읽기를 시작해 보세요!',
    date: '날짜',
    passage: '구절',
    unsubscribe: '수신 거부',
  },
  fr: {
    my_bible_log: 'My Bible Log',
    this_is_your_reminder: 'Voici votre e-mail de rappel quotidien de My Bible Log.',
    you_can_update_preferences: (settingsLink) => `Vous pouvez modifier vos préférences de rappel <a href="${settingsLink}">ici</a>.`,
    open_my_bible_log: 'Ouvrir My Bible Log',
    most_recent_log_entries: 'Dernières entrées du journal',
    no_log_entries_found: 'Aucune entrée trouvée dans le journal. Il est temps de commencer à lire!',
    date: 'Date',
    passage: 'Passage',
    unsubscribe: 'Se désabonner',
  },
  pt: {
    my_bible_log: 'My Bible Log',
    this_is_your_reminder: 'Este é seu e-mail de lembrete diário do My Bible Log.',
    you_can_update_preferences: (settingsLink) => `Você pode atualizar suas preferências de lembrete <a href="${settingsLink}">aqui</a>.`,
    open_my_bible_log: 'Abrir My Bible Log',
    most_recent_log_entries: 'Entradas mais recentes do registro',
    no_log_entries_found: 'Nenhuma entrada encontrada no registro. É hora de começar a ler!',
    date: 'Data',
    passage: 'Passagem',
    unsubscribe: 'Cancelar inscrição',
  },
  uk: {
    my_bible_log: 'My Bible Log',
    this_is_your_reminder: 'Це ваш щоденний лист-нагадування від Мого My Bible Log.',
    you_can_update_preferences: (settingsLink) => `Ви можете змінити налаштування нагадувань <a href="${settingsLink}">тут</a>.`,
    open_my_bible_log: 'Відкрити My Bible Log',
    most_recent_log_entries: 'Останні записи в журналі',
    no_log_entries_found: 'Немає записів в журналі. Час почати читати!',
    date: 'Дата',
    passage: 'Пасаж',
    unsubscribe: 'Відписатися',
  },
};

type RenderDailyReminderEmailParams = {
  siteLink: string;
  settingsLink: string;
  unsubscribeLink: string;
  recentLogEntries: { displayDate: string, passage: string }[];
  emailDate: Date;
  locale: LocaleCode;
};

const render = ({
  siteLink,
  settingsLink,
  unsubscribeLink,
  recentLogEntries,
  emailDate,
  locale,
}: RenderDailyReminderEmailParams) => {
  const t = translations[locale];
  const dateFormatOptions: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  const subjectDate = new Intl.DateTimeFormat(locale, dateFormatOptions).format(emailDate);

  const subject = {
    de: `My Bible Log Erinnerung für ${subjectDate}`,
    en: `My Bible Log Reminder for ${subjectDate}`,
    es: `Recordatorio de My Bible Log para ${subjectDate}`,
    fr: `Rappel de My Bible Log pour le ${subjectDate}`,
    ko: `My Bible Log 알림 (${subjectDate})`,
    pt: `Lembrete do My Bible Log para ${subjectDate}`,
    uk: `Нагадування My Bible Log для ${subjectDate}`,
  }[locale];

  /* eslint-disable indent */
  const recentLogEntriesRowsHtml = recentLogEntries.length > 0
    ? recentLogEntries.map((logEntry) => (`
        <tr>
          <td>${logEntry.displayDate}</td>
          <td>${logEntry.passage}</td>
        </tr>
      `)).join('')
    : `<tr><td colspan="2">${t.no_log_entries_found}</td></tr>`;

  const contentHtml = (`
    <p class="text-centered">${t.this_is_your_reminder}</p>
    <p class="text-centered">${t.you_can_update_preferences(settingsLink)}</p>
    <p class="cta-container text-centered">
      <a class="cta-button" href="${siteLink}">
        ${t.open_my_bible_log}
      </a>
    </p>
    <p><strong>${t.most_recent_log_entries}</strong></p>
    <table class="log-entry-table" border="0" cellpadding="5" cellspacing="0" width="100%">
      <thead>
        <tr>
          <th>${t.date}</th>
          <th>${t.passage}</th>
        </tr>
      </thead>
      <tbody>
        ${recentLogEntriesRowsHtml}
      </tbody>
    </table>
  `);

  const footerHtml = `<p><a href="${unsubscribeLink}">${t.unsubscribe}</a></p>`;
  /* eslint-enable indent */

  const html = renderBrandedEmail({ title: subject, contentHtml, footerHtml });
  return {
    subject,
    html,
  };
};

export default render;
