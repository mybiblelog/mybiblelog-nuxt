<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.daily_verse_count_goal.title') }}
    </h2>
    <div class="content">
      <p>
        {{ $t('start_page.daily_verse_count_goal.description') }}
      </p>
      <p>
        {{ $t('start_page.daily_verse_count_goal.year_hint') }}
      </p>
      <p>
        {{ $t('start_page.daily_verse_count_goal.goal_date_hint') }}
      </p>
    </div>

    <div class="field">
      <label class="label">{{ $t('start_page.daily_verse_count_goal.goal_finish_date') }}</label>
      <div class="control">
        <input
          v-model="goalFinishDate"
          class="input"
          type="date"
          :min="minDate"
        >
      </div>
      <p v-if="goalFinishDate && calculatedDailyGoal" class="help">
        {{ $t('start_page.daily_verse_count_goal.calculated_goal', {
          dailyGoal: calculatedDailyGoal,
          days: daysToFinish
        }) }}
      </p>
    </div>

    <div class="field">
      <label class="label">{{ $t('start_page.daily_verse_count_goal.daily_verse_count') }}</label>
      <div class="control">
        <input
          v-model.number="dailyVerseCountGoal"
          class="input"
          type="number"
          min="1"
          max="1111"
        >
      </div>
    </div>

    <div v-if="error" class="help is-danger">
      {{ error }}
    </div>

    <div class="content">
      <p class="help">
        {{ $t('start_page.daily_verse_count_goal.change_hint') }}
      </p>
    </div>

    <div class="field">
      <div class="control">
        <button class="button is-primary" :disabled="isSaving" @click="handleSubmit">
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as dayjs from 'dayjs';

const TOTAL_BIBLE_VERSES = 31102;

export default {
  name: 'DailyVerseCountGoalForm',
  props: {
    initialValue: {
      type: Number,
      default: 0,
    },
    buttonText: {
      type: String,
      default: 'Save and Continue',
    },
    showToast: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      dailyVerseCountGoal: this.initialValue || 0,
      goalFinishDate: '',
      error: '',
      isSaving: false,
    };
  },
  computed: {
    minDate() {
      return dayjs().add(1, 'day').format('YYYY-MM-DD');
    },
    daysToFinish() {
      if (!this.goalFinishDate) { return null; }
      const today = dayjs().startOf('day');
      const goalDate = dayjs(this.goalFinishDate).startOf('day');
      const difference = goalDate.diff(today, 'day');
      return difference > 0 ? difference : null;
    },
    calculatedDailyGoal() {
      if (!this.daysToFinish || this.daysToFinish <= 0) { return null; }
      return Math.ceil(TOTAL_BIBLE_VERSES / this.daysToFinish);
    },
  },
  watch: {
    goalFinishDate(newDate) {
      if (newDate && this.calculatedDailyGoal) {
        this.dailyVerseCountGoal = this.calculatedDailyGoal;
      }
    },
    initialValue(newValue) {
      if (newValue) {
        this.dailyVerseCountGoal = newValue;
      }
    },
  },
  methods: {
    async handleSubmit() {
      this.error = '';

      if (!this.dailyVerseCountGoal || this.dailyVerseCountGoal < 1 || this.dailyVerseCountGoal > 1111) {
        this.error = this.$t('messaging.unable_to_save_daily_verse_count_goal');
        return;
      }

      this.isSaving = true;
      const success = await this.$store.dispatch('user-settings/updateSettings', {
        dailyVerseCountGoal: this.dailyVerseCountGoal,
      });

      if (success) {
        if (this.showToast) {
          this.$store.dispatch('toast/add', {
            type: 'success',
            text: this.$t('messaging.daily_verse_count_goal_saved_successfully'),
          });
        }
        this.$emit('saved', this.dailyVerseCountGoal);
        this.$emit('next');
      }
      else {
        this.error = this.$t('messaging.unable_to_save_daily_verse_count_goal');
      }

      this.isSaving = false;
    },
  },
};
</script>

<i18n lang="json">
{
  "de": {
    "start_page": {
      "daily_verse_count_goal": {
        "title": "Tägliche Verszahl Ziel",
        "description": "Ihr Tägliches Verszahl-Ziel ist die Anzahl der Verse, die Sie jeden Tag lesen möchten.",
        "year_hint": "Wenn Sie 86 neue Verse pro Tag lesen, werden Sie die ganze Bibel in einem Jahr lesen.",
        "goal_date_hint": "Sie können ein Zieldatum wählen, um die Bibel fertigzulesen, um zu sehen, wie viele Verse Sie jeden Tag lesen müssen, um dorthin zu gelangen.",
        "goal_finish_date": "Ziel-Fertigstellungsdatum",
        "daily_verse_count": "Tägliche Verszahl Ziel",
        "calculated_goal": "Um bis zu Ihrem Zieldatum fertig zu werden, müssen Sie {dailyGoal} Verse pro Tag lesen ({days} Tage).",
        "change_hint": "Sie können diese Einstellung jederzeit ändern."
      }
    },
    "messaging": {
      "daily_verse_count_goal_saved_successfully": "Tägliche Verszahl Ziel erfolgreich gespeichert.",
      "unable_to_save_daily_verse_count_goal": "Nicht gespeichert. Bitte geben Sie eine Zahl zwischen 1 und 1111 ein."
    }
  },
  "en": {
    "start_page": {
      "daily_verse_count_goal": {
        "title": "Daily Verse Count Goal",
        "description": "Your Daily Verse Count Goal is the number of verses you want to read each day.",
        "year_hint": "If you read 86 new verses a day, you will read the whole Bible in a year.",
        "goal_date_hint": "You can choose a goal date to finish reading the Bible to see how many verses you will need to read each day to get there.",
        "goal_finish_date": "Goal Finish Date",
        "daily_verse_count": "Daily Verse Count Goal",
        "calculated_goal": "To finish by your goal date, you'll need to read {dailyGoal} verses per day ({days} days).",
        "change_hint": "You can change this setting at any time."
      }
    },
    "messaging": {
      "daily_verse_count_goal_saved_successfully": "Daily verse count goal saved successfully.",
      "unable_to_save_daily_verse_count_goal": "Unable to save. Please enter a number between 1 and 1111."
    }
  },
  "es": {
    "start_page": {
      "daily_verse_count_goal": {
        "title": "Meta de Versículos Diarios",
        "description": "Su Meta de Versículos Diarios es el número de versículos que desea leer cada día.",
        "year_hint": "Si lee 86 versículos nuevos al día, leerá toda la Biblia en un año.",
        "goal_date_hint": "Puede elegir una fecha objetivo para terminar de leer la Biblia para ver cuántos versículos necesitará leer cada día para llegar allí.",
        "goal_finish_date": "Fecha de Finalización del Objetivo",
        "daily_verse_count": "Meta de Versículos Diarios",
        "calculated_goal": "Para terminar para su fecha objetivo, necesitará leer {dailyGoal} versículos por día ({days} días).",
        "change_hint": "Puede cambiar esta configuración en cualquier momento."
      }
    },
    "messaging": {
      "daily_verse_count_goal_saved_successfully": "Meta de versículos diarios guardada con éxito.",
      "unable_to_save_daily_verse_count_goal": "No se puede guardar. Por favor ingrese un número entre 1 y 1111."
    }
  },
  "fr": {
    "start_page": {
      "daily_verse_count_goal": {
        "title": "Objectif de nombre de versets quotidiens",
        "description": "Votre Objectif de nombre de versets quotidiens est le nombre de versets que vous souhaitez lire chaque jour.",
        "year_hint": "Si vous lisez 86 nouveaux versets par jour, vous lirez toute la Bible en un an.",
        "goal_date_hint": "Vous pouvez choisir une date cible pour terminer la lecture de la Bible pour voir combien de versets vous devrez lire chaque jour pour y arriver.",
        "goal_finish_date": "Date de fin de l'objectif",
        "daily_verse_count": "Objectif de nombre de versets quotidiens",
        "calculated_goal": "Pour terminer à votre date cible, vous devrez lire {dailyGoal} versets par jour ({days} jours).",
        "change_hint": "Vous pouvez modifier ce paramètre à tout moment."
      }
    },
    "messaging": {
      "daily_verse_count_goal_saved_successfully": "Objectif de nombre de versets quotidiens enregistré avec succès.",
      "unable_to_save_daily_verse_count_goal": "Impossible d'enregistrer. Veuillez entrer un nombre entre 1 et 1111."
    }
  },
  "pt": {
    "start_page": {
      "daily_verse_count_goal": {
        "title": "Meta Diária de Versículos",
        "description": "Sua Meta Diária de Versículos é o número de versículos que você deseja ler a cada dia.",
        "year_hint": "Se você ler 86 versículos novos por dia, lerá toda a Bíblia em um ano.",
        "goal_date_hint": "Você pode escolher uma data objetivo para terminar de ler a Bíblia para ver quantos versículos precisará ler cada dia para chegar lá.",
        "goal_finish_date": "Data de Conclusão do Objetivo",
        "daily_verse_count": "Meta Diária de Versículos",
        "calculated_goal": "Para terminar até sua data objetivo, você precisará ler {dailyGoal} versículos por dia ({days} dias).",
        "change_hint": "Você pode alterar esta configuração a qualquer momento."
      }
    },
    "messaging": {
      "daily_verse_count_goal_saved_successfully": "Meta de versículos diários salva com sucesso.",
      "unable_to_save_daily_verse_count_goal": "Não foi possível salvar. Por favor, insira um número entre 1 e 1111."
    }
  },
  "uk": {
    "start_page": {
      "daily_verse_count_goal": {
        "title": "Мета щоденної кількості віршів",
        "description": "Ваша Мета щоденної кількості віршів - це кількість віршів, яку ви хочете читати кожен день.",
        "year_hint": "Якщо ви читаєте 86 нових віршів на день, ви прочитаєте всю Біблію за рік.",
        "goal_date_hint": "Ви можете вибрати цільову дату завершення читання Біблії, щоб побачити, скільки віршів вам потрібно буде читати щодня, щоб досягти цього.",
        "goal_finish_date": "Дата завершення мети",
        "daily_verse_count": "Мета щоденної кількості віршів",
        "calculated_goal": "Щоб завершити до вашої цільової дати, вам потрібно буде читати {dailyGoal} віршів на день ({days} днів).",
        "change_hint": "Ви можете змінити це налаштування в будь-який час."
      }
    },
    "messaging": {
      "daily_verse_count_goal_saved_successfully": "Мету щоденної кількості віршів успішно збережено.",
      "unable_to_save_daily_verse_count_goal": "Не вдалося зберегти. Будь ласка, введіть число від 1 до 1111."
    }
  }
}
</i18n>
