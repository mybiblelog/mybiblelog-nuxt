<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.start_page.title') }}
    </h2>
    <div class="content">
      <p>
        {{ $t('start_page.start_page.description') }}
      </p>
    </div>

    <div v-if="error" class="help is-danger">
      {{ error }}
    </div>

    <div class="content">
      <p class="help">
        {{ $t('start_page.start_page.change_hint') }}
      </p>
    </div>

    <div class="columns is-multiline">
      <div
        v-for="option in startPageOptions"
        :key="option.value"
        class="column is-full"
      >
        <div
          class="box tile-box"
          :class="{ 'has-background-primary-light': startPage === option.value }"
          style="cursor: pointer;"
          @click="startPage = option.value"
        >
          <figure v-if="option.image" class="image tile-image">
            <img :src="option.image" :alt="option.text">
          </figure>
          <div class="tile-content">
            <h3 class="title is-6">
              {{ option.text }}
              <span v-if="option.isDefault" class="tag is-light default-badge">
                {{ $t('start_page.start_page.default_badge') }}
              </span>
            </h3>
            <p>{{ option.description }}</p>
            <button
              class="button is-info is-small"
              @click.stop="handleSelect(option.value)"
            >
              {{ $t('start_page.start_page.start_here') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="field">
      <div class="control">
        <button class="button" @click="handlePrevious">
          {{ previousButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StartPageForm',
  props: {
    initialValue: {
      type: String,
      default: '',
    },
    nextButtonText: {
      type: String,
      default: 'Save and Continue',
    },
    previousButtonText: {
      type: String,
      default: 'Back',
    },
    showToast: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      startPage: this.initialValue || 'today',
      error: '',
      isSaving: false,
    };
  },
  computed: {
    startPageOptions() {
      return [
        {
          value: 'today',
          text: this.$t('today'),
          description: this.$t('start_page.start_page.options.today'),
          image: '/screenshots/sc3-daily-progress.jpg',
          isDefault: true,
        },
        {
          value: 'books',
          text: this.$t('bible_books'),
          description: this.$t('start_page.start_page.options.books'),
          image: '/screenshots/sc7-bible-progress.jpg',
        },
        {
          value: 'checklist',
          text: this.$t('chapter_checklist'),
          description: this.$t('start_page.start_page.options.checklist'),
          image: '/screenshots/sc12-checklist.jpg',
        },
        {
          value: 'calendar',
          text: this.$t('calendar'),
          description: this.$t('start_page.start_page.options.calendar'),
          image: '/screenshots/sc9-calendar.jpg',
        },
        {
          value: 'notes',
          text: this.$t('notes'),
          description: this.$t('start_page.start_page.options.notes'),
          image: '/screenshots/sc10-notes.jpg',
        },
      ];
    },
  },
  watch: {
    initialValue(newValue) {
      if (newValue) {
        this.startPage = newValue;
      }
    },
  },
  methods: {
    handlePrevious() {
      this.$emit('previous');
    },
    async handleSelect(value) {
      this.startPage = value;
      await this.handleSubmit();
    },
    async handleSubmit() {
      this.error = '';

      if (!this.startPage) {
        this.error = this.$t('messaging.unable_to_save_preferred_start_page');
        return;
      }

      this.isSaving = true;
      const success = await this.$store.dispatch('user-settings/updateSettings', {
        startPage: this.startPage,
      });

      if (success) {
        if (this.showToast) {
          this.$store.dispatch('toast/add', {
            type: 'success',
            text: this.$t('messaging.preferred_start_page_saved_successfully'),
          });
        }
        this.$emit('saved', this.startPage);
        this.$emit('next');
      }
      else {
        this.error = this.$t('messaging.unable_to_save_preferred_start_page');
      }

      this.isSaving = false;
    },
  },
};
</script>

<style scoped>
.tile-box {
  transition: all 0.2s;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding: 1rem;
}

.tile-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tile-image {
  flex-shrink: 0;
  width: 200px;
  max-width: 200px;
  margin: 0;
  border-radius: 4px;
  overflow: hidden;
}

.tile-image img {
  width: 100%;
  max-width: 200px;
  max-height: 200px;
  height: auto;
  object-fit: contain;
  display: block;
}

.tile-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.title.is-6 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.default-badge {
  font-size: 0.75rem;
  font-weight: normal;
  margin-left: 0.25rem;
}

.tile-content p {
  flex: 1;
  margin-bottom: 1rem;
}

.button {
  align-self: flex-start;
  margin-top: auto;
}

@media screen and (max-width: 768px) {
  .tile-box {
    flex-direction: column;
  }

  .tile-image {
    width: 100%;
    max-width: 100%;
    max-height: 200px;
  }

  .tile-image img {
    width: 100%;
    max-width: 100%;
    max-height: 200px;
    height: auto;
  }
}
</style>

<i18n lang="json">
{
  "de": {
    "start_page": {
      "start_page": {
        "title": "Startseite",
        "description": "Sie können den ersten Bildschirm wählen, der sich öffnet, wenn Sie sich bei My Bible Log anmelden.",
        "start_here": "Hier starten",
        "default_badge": "Vorgeschlagen",
        "change_hint": "Sie können diese Einstellung später jederzeit auf der Einstellungsseite ändern.",
        "options": {
          "today": "Die Heute-Seite zeigt Ihren Fortschritt zu Ihrem täglichen Verszahl-Ziel. Sie zeigt die Lektüre, die Sie bereits für den Tag protokolliert haben. Sie bietet auch Lesevorschläge, um Ihnen zu helfen, etwas Neues zum Lesen zu finden.",
          "books": "Die Bibelbücher-Seite zeigt Ihren Lese-Fortschritt für die ganze Bibel und jedes einzelne Buch. Sie können ein Buch auswählen, um Ihren Fortschritt über seine Kapitel zu sehen. Von dort aus können Sie jedes Kapitel lesen.",
          "checklist": "Die Kapitel-Checkliste ist der schnellste und einfachste Weg, um Ihre Lektüre zu protokollieren. Mit einem Tippen oder Klicken können Sie ein Kapitel als abgeschlossen markieren.",
          "calendar": "Der Kalender zeigt Ihre Lesegewohnheiten im Laufe der Zeit. Sie können sehen, wie konsequent Sie Ihr tägliches Ziel erreichen, sowie was Sie an einem bestimmten Tag gelesen haben.",
          "notes": "Die Notizen-Seite zeigt Ihre Lese-Notizen, die mit Bibelstellen verknüpft werden können. Sie können Ihre Notizen mit Ihren eigenen benutzerdefinierten Tags organisieren, wie \"Gedächtnisverse\", \"Fragen\" oder \"Gebet\". Diese Seite ermöglicht es Ihnen, Notizen zu suchen, zu sortieren und zu filtern, um Ihre persönliche Bibelstudie einfach zu verwalten."
        }
      }
    },
    "today": "Heute",
    "bible_books": "Bibelbücher",
    "chapter_checklist": "Kapitel Checkliste",
    "calendar": "Kalender",
    "notes": "Notizen",
    "messaging": {
      "preferred_start_page_saved_successfully": "Bevorzugte Startseite erfolgreich gespeichert.",
      "unable_to_save_preferred_start_page": "Nicht gespeichert."
    }
  },
  "en": {
    "start_page": {
      "start_page": {
        "title": "Start Page",
        "description": "You can choose the first screen that opens when you log into My Bible Log.",
        "start_here": "Start Here",
        "default_badge": "Suggested",
        "change_hint": "You can always change this setting later in the settings page.",
        "options": {
          "today": "The Today page shows your progress toward your Daily Verse Count Goal. It shows the reading you've already logged for the day. It also offers reading suggestions to help you find something new to read.",
          "books": "The Bible Books page shows your reading progress for the whole Bible and each individual book. You can choose a book to see your progress across its chapters. From there, you can start reading any chapter.",
          "checklist": "The Chapter Checklist is the fastest and simplest way to log your reading. With one tap or click, you can mark a chapter complete.",
          "calendar": "The Calendar shows your reading patterns over time. You can see how consistently you are meeting your daily goal, as well as what you've read on any given day.",
          "notes": "The Notes page shows your reading notes, which can be linked to Bible passages. You can organize your notes with your own custom tags, like \"Memory Verses\", \"Questions\", or \"Prayer\". This page allows you to search, sort, and filter notes to easily manage your personal Bible study."
        }
      }
    },
    "today": "Today",
    "bible_books": "Bible Books",
    "chapter_checklist": "Chapter Checklist",
    "calendar": "Calendar",
    "notes": "Notes",
    "messaging": {
      "preferred_start_page_saved_successfully": "Preferred start page saved successfully.",
      "unable_to_save_preferred_start_page": "Unable to save."
    }
  },
  "es": {
    "start_page": {
      "start_page": {
        "title": "Página de Inicio",
        "description": "Puede elegir la primera pantalla que se abre cuando inicia sesión en My Bible Log.",
        "start_here": "Comenzar Aquí",
        "default_badge": "Sugerido",
        "change_hint": "Siempre puede cambiar esta configuración más tarde en la página de configuración.",
        "options": {
          "today": "La página Hoy muestra su progreso hacia su Meta de Versículos Diarios. Muestra la lectura que ya ha registrado para el día. También ofrece sugerencias de lectura para ayudarle a encontrar algo nuevo para leer.",
          "books": "La página Libros Bíblicos muestra su progreso de lectura para toda la Biblia y cada libro individual. Puede elegir un libro para ver su progreso a través de sus capítulos. Desde allí, puede comenzar a leer cualquier capítulo.",
          "checklist": "La Lista de Capítulos es la forma más rápida y simple de registrar su lectura. Con un toque o clic, puede marcar un capítulo como completo.",
          "calendar": "El Calendario muestra sus patrones de lectura a lo largo del tiempo. Puede ver qué tan consistentemente está cumpliendo su objetivo diario, así como lo que ha leído en un día determinado.",
          "notes": "La página Notas muestra sus notas de lectura, que pueden estar vinculadas a pasajes bíblicos. Puede organizar sus notas con sus propias etiquetas personalizadas, como \"Versos de Memoria\", \"Preguntas\" o \"Oración\". Esta página le permite buscar, ordenar y filtrar notas para administrar fácilmente su estudio bíblico personal."
        }
      }
    },
    "today": "Hoy",
    "bible_books": "Libros Bíblicos",
    "chapter_checklist": "Lista de Capítulos",
    "calendar": "Calendario",
    "notes": "Notas",
    "messaging": {
      "preferred_start_page_saved_successfully": "Página de inicio preferida guardada con éxito.",
      "unable_to_save_preferred_start_page": "No se puede guardar."
    }
  },
  "fr": {
    "start_page": {
      "start_page": {
        "title": "Page de démarrage",
        "description": "Vous pouvez choisir le premier écran qui s'ouvre lorsque vous vous connectez à My Bible Log.",
        "start_here": "Commencer ici",
        "default_badge": "Suggéré",
        "change_hint": "Vous pouvez toujours modifier ce paramètre plus tard dans la page des paramètres.",
        "options": {
          "today": "La page Aujourd'hui montre votre progression vers votre objectif de nombre de versets quotidiens. Elle montre la lecture que vous avez déjà enregistrée pour la journée. Elle offre également des suggestions de lecture pour vous aider à trouver quelque chose de nouveau à lire.",
          "books": "La page Livres de la Bible montre votre progression de lecture pour toute la Bible et chaque livre individuel. Vous pouvez choisir un livre pour voir votre progression à travers ses chapitres. De là, vous pouvez commencer à lire n'importe quel chapitre.",
          "checklist": "La Liste de Contrôle des Chapitres est le moyen le plus rapide et le plus simple d'enregistrer votre lecture. D'un simple tap ou clic, vous pouvez marquer un chapitre comme terminé.",
          "calendar": "Le Calendrier montre vos habitudes de lecture au fil du temps. Vous pouvez voir à quel point vous respectez régulièrement votre objectif quotidien, ainsi que ce que vous avez lu un jour donné.",
          "notes": "La page Notes montre vos notes de lecture, qui peuvent être liées à des passages bibliques. Vous pouvez organiser vos notes avec vos propres tags personnalisés, comme \"Versets de Mémoire\", \"Questions\" ou \"Prière\". Cette page vous permet de rechercher, trier et filtrer les notes pour gérer facilement votre étude biblique personnelle."
        }
      }
    },
    "today": "Aujourd'hui",
    "bible_books": "Livres de la Bible",
    "chapter_checklist": "Liste de Contrôle",
    "calendar": "Calendrier",
    "notes": "Notes",
    "messaging": {
      "preferred_start_page_saved_successfully": "Page de démarrage préférée enregistrée avec succès.",
      "unable_to_save_preferred_start_page": "Impossible d'enregistrer."
    }
  },
  "pt": {
    "start_page": {
      "start_page": {
        "title": "Página de Início",
        "description": "Você pode escolher a primeira tela que abre quando faz login no My Bible Log.",
        "start_here": "Começar Aqui",
        "default_badge": "Sugerido",
        "change_hint": "Você sempre pode alterar esta configuração mais tarde na página de configurações.",
        "options": {
          "today": "A página Hoje mostra seu progresso em direção à sua Meta Diária de Versículos. Ela mostra a leitura que você já registrou para o dia. Também oferece sugestões de leitura para ajudá-lo a encontrar algo novo para ler.",
          "books": "A página Livros da Bíblia mostra seu progresso de leitura para toda a Bíblia e cada livro individual. Você pode escolher um livro para ver seu progresso através de seus capítulos. A partir daí, você pode começar a ler qualquer capítulo.",
          "checklist": "A Lista de Capítulos é a forma mais rápida e simples de registrar sua leitura. Com um toque ou clique, você pode marcar um capítulo como completo.",
          "calendar": "O Calendário mostra seus padrões de leitura ao longo do tempo. Você pode ver quão consistentemente está cumprindo sua meta diária, bem como o que leu em um determinado dia.",
          "notes": "A página Notas mostra suas notas de leitura, que podem ser vinculadas a passagens bíblicas. Você pode organizar suas notas com suas próprias tags personalizadas, como \"Versos de Memória\", \"Perguntas\" ou \"Oração\". Esta página permite que você pesquise, ordene e filtre notas para gerenciar facilmente seu estudo bíblico pessoal."
        }
      }
    },
    "today": "Hoje",
    "bible_books": "Livros da Bíblia",
    "chapter_checklist": "Lista de Capítulos",
    "calendar": "Calendário",
    "notes": "Notas",
    "messaging": {
      "preferred_start_page_saved_successfully": "Página de início preferida salva com sucesso.",
      "unable_to_save_preferred_start_page": "Não é possível salvar."
    }
  },
  "uk": {
    "start_page": {
      "start_page": {
        "title": "Стартова сторінка",
        "description": "Ви можете вибрати перший екран, який відкривається, коли ви входите в My Bible Log.",
        "start_here": "Почніть тут",
        "default_badge": "Запропоновано",
        "change_hint": "Ви завжди можете змінити це налаштування пізніше на сторінці налаштувань.",
        "options": {
          "today": "Сторінка Сьогодні показує ваш прогрес до вашої мети щоденної кількості віршів. Вона показує читання, яке ви вже зареєстрували на день. Вона також пропонує пропозиції для читання, щоб допомогти вам знайти щось нове для читання.",
          "books": "Сторінка Книги Біблії показує ваш прогрес читання для всієї Біблії та кожної окремої книги. Ви можете вибрати книгу, щоб побачити свій прогрес по її розділах. Звідти ви можете почати читати будь-який розділ.",
          "checklist": "Список розділів - це найшвидший і найпростіший спосіб зареєструвати ваше читання. Одним натисканням або кліком ви можете позначити розділ як завершений.",
          "calendar": "Календар показує ваші звички читання з часом. Ви можете побачити, наскільки послідовно ви досягаєте своєї щоденної мети, а також те, що ви читали в будь-який день.",
          "notes": "Сторінка Нотатки показує ваші нотатки для читання, які можуть бути пов'язані з біблійними уривками. Ви можете організувати свої нотатки зі своїми власними тегами, такими як \"Вірші на пам'ять\", \"Питання\" або \"Молитва\". Ця сторінка дозволяє вам шукати, сортувати та фільтрувати нотатки для легкого управління вашим особистим біблійним вивченням."
        }
      }
    },
    "today": "Сьогодні",
    "bible_books": "Книги Біблії",
    "chapter_checklist": "Список розділів",
    "calendar": "Календар",
    "notes": "Нотатки",
    "messaging": {
      "preferred_start_page_saved_successfully": "Обрану стартову сторінку успішно збережено.",
      "unable_to_save_preferred_start_page": "Не вдалося зберегти."
    }
  }
}
</i18n>
