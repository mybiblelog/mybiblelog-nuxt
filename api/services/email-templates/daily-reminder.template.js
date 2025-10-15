const translations = {
  de: {
    my_bible_log: 'My Bible Log',
    this_is_your_reminder: 'Dies ist Ihr täglicher Erinnerungs-E-Mail von My Bible Log.',
    you_can_update_preferences: settingsLink => `Sie können Ihre Erinnerungseinstellungen <a href="${settingsLink}">hier</a> aktualisieren.`,
    open_my_bible_log: 'My Bible Log öffnen',
    most_recent_log_entries: 'Letzte Einträge im Journal',
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
              <img class="brand" alt="" src="cid:brand.png" width="50" height="50">
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
                  ${recentLogEntries.map(logEntry => (`
                    <tr>
                      <td>${logEntry.displayDate}</td>
                      <td>${logEntry.passage}</td>
                    </tr>
                  `)).join('')}
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

const render = ({
  siteLink,
  settingsLink,
  unsubscribeLink,
  recentLogEntries,
  locale,
}) => (
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

module.exports = render;
