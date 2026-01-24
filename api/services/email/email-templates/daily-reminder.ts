import { LocaleCode } from "@shared/dist/i18n";

const translations = {
  de: {
    my_bible_log: 'My Bible Log',
    this_is_your_reminder: 'Dies ist Ihr täglicher Erinnerungs-E-Mail von My Bible Log.',
    you_can_update_preferences: settingsLink => `Sie können Ihre Erinnerungseinstellungen <a href="${settingsLink}">hier</a> aktualisieren.`,
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
    you_can_update_preferences: settingsLink => `You can update your reminder preferences <a href="${settingsLink}">here</a>.`,
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
    you_can_update_preferences: settingsLink => `Puedes actualizar tus preferencias de recordatorio <a href="${settingsLink}">aquí</a>.`,
    open_my_bible_log: 'Abrir My Bible Log',
    most_recent_log_entries: 'Entradas más recientes del registro',
    no_log_entries_found: 'No se encontraron entradas en el registro. ¡Tiempo de empezar a leer!',
    date: 'Fecha',
    passage: 'Pasaje',
    unsubscribe: 'Cancelar suscripción',
  },
  fr: {
    my_bible_log: 'My Bible Log',
    this_is_your_reminder: 'Voici votre e-mail de rappel quotidien de My Bible Log.',
    you_can_update_preferences: settingsLink => `Vous pouvez modifier vos préférences de rappel <a href="${settingsLink}">ici</a>.`,
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
    you_can_update_preferences: settingsLink => `Você pode atualizar suas preferências de lembrete <a href="${settingsLink}">aqui</a>.`,
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
    you_can_update_preferences: settingsLink => `Ви можете змінити налаштування нагадувань <a href="${settingsLink}">тут</a>.`,
    open_my_bible_log: 'Відкрити My Bible Log',
    most_recent_log_entries: 'Останні записи в журналі',
    no_log_entries_found: 'Немає записів в журналі. Час почати читати!',
    date: 'Дата',
    passage: 'Пасаж',
    unsubscribe: 'Відписатися',
  },
};

const renderHead = () => (`
  <head>
    <style>
      .gray {
        background: #eee;
      }

      .title-box {
        background: #1f3d7a;
        color: #fff;
      }

      .content-area {
        padding: 15px;
      }

      h1 {
        font-size: 35px;
        margin: 0;
      }

      .brand {
        vertical-align: middle;
        padding-right: 5px;
      }

      .text-centered {
        text-align: center;
      }

      .cta-container {
        margin-top: 3em;
        margin-bottom: 4em;
      }

      .cta-button {
        color: #fff !important;
        background: #3298dc;
        text-align: center;
        text-decoration: none;
        padding: 0.5em 1em;
        white-space: nowrap;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
      }

      .cta-button:hover {
        background: #2793da;
      }

      .log-entry-table {
        border-collapse: collapse;
      }

      .log-entry-table th,
      .log-entry-table td {
        text-align: left;
        border: 0;
      }

      .log-entry-table td {
        border-top: 1px solid #333;
      }
    </style>
  </head>`
);

const renderBody = ({
  siteLink,
  settingsLink,
  unsubscribeLink,
  recentLogEntries,
  t,
}) => (`
  <body>
    <table border="0" cellpadding="5" cellspacing="0" width="100%">
      <tbody>
        <tr>
          <td class="gray" colspan="3">&nbsp;</td>
        </tr>
        <tr>
          <td class="gray" width="*"></td>
          <td class="title-box content-area" width="500px">
            <h1></h1>
              <img class="brand" alt="" src="cid:logo@mybiblelog" width="50" height="50">
              ${t.my_bible_log}
            </h1>
          </td>
          <td class="gray" width="*"></td>
        </tr>
        <tr>
          <td class="gray" width="*"></td>
          <td class="content-area" width="500px">
            <p class="text-centered">${t.this_is_your_reminder}</p>
            <p class="text-centered">${t.you_can_update_preferences(settingsLink)}</p>
            <p class="cta-container text-centered">
              <a class="cta-button" href="${siteLink}">
                ${t.open_my_bible_log}
              </a>
            </p>
            <p>
              <strong>${t.most_recent_log_entries}</strong>
            </p>
            <p>
              <table class="log-entry-table" border="0" cellpadding="5" cellspacing="0" width="100%">
                <thead>
                  <tr>
                    <th>${t.date}</th>
                    <th>${t.passage}</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentLogEntries.length > 0 ? (
                    recentLogEntries.map(logEntry => (`
                      <tr>
                        <td>${logEntry.displayDate}</td>
                        <td>${logEntry.passage}</td>
                      </tr>
                    `)).join('')
                  ) : (
                    `<tr><td colspan="2">${t.no_log_entries_found}</td></tr>`
                  )}
                </tbody>
              </table>
            </p>
          </td>
          <td class="gray"></td>
        </tr>
        <tr>
          <td class="gray" width="*"></td>
          <td class="gray content-area text-centered">
            <p>
              <a href="${unsubscribeLink}">${t.unsubscribe}</a>
            </p>
          </td>
          <td class="gray"></td>
        </tr>
      </tbody>
    </table>
  </body>`
);

type RenderDailyReminderEmailParams = {
  siteLink: string;
  settingsLink: string;
  unsubscribeLink: string;
  recentLogEntries: any[];
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
  const dateFormatOptions: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  const subjectDate = new Intl.DateTimeFormat(locale, dateFormatOptions).format(emailDate);

  const subject = {
    de: `My Bible Log Erinnerung für ${subjectDate}`,
    en: `My Bible Log Reminder for ${subjectDate}`,
    es: `Recordatorio de My Bible Log para ${subjectDate}`,
    fr: `Rappel de My Bible Log pour le ${subjectDate}`,
    pt: `Lembrete do My Bible Log para ${subjectDate}`,
    uk: `Нагадування My Bible Log для ${subjectDate}`,
  }[locale];

  const html = (
    `<html>
    ${renderHead()}
    ${renderBody({
      siteLink,
      settingsLink,
      unsubscribeLink,
      recentLogEntries,
      t: translations[locale],
    })}
    </html>`
  );
  return {
    subject,
    html,
  };
};

export default render;
