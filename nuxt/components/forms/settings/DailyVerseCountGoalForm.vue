<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.daily_verse_count_goal.title') }}
    </h2>
    <div class="content">
      <p>
        {{ $t('start_page.daily_verse_count_goal.description') }}
      </p>
    </div>

    <div class="field">
      <label class="label">{{ $t('start_page.daily_verse_count_goal.i_want_to') }}</label>
      <div class="control">
        <label class="radio">
          <input v-model="selectedOption" type="radio" value="2years">
          {{ $t('start_page.daily_verse_count_goal.read_in_2_years') }}
        </label>
      </div>
      <div class="control">
        <label class="radio">
          <input v-model="selectedOption" type="radio" value="year">
          {{ $t('start_page.daily_verse_count_goal.read_in_year') }}
        </label>
      </div>
      <div class="control">
        <label class="radio">
          <input v-model="selectedOption" type="radio" value="6months">
          {{ $t('start_page.daily_verse_count_goal.read_in_6_months') }}
        </label>
      </div>
      <div class="control">
        <label class="radio">
          <input v-model="selectedOption" type="radio" value="specific">
          {{ $t('start_page.daily_verse_count_goal.read_by_specific_date') }}
        </label>
      </div>
    </div>

    <div class="field">
      <label class="label">{{ $t('start_page.daily_verse_count_goal.goal_finish_date') }}</label>
      <div class="control">
        <input
          v-model="goalFinishDate"
          class="input"
          type="date"
          :min="minDate"
          @input="handleDateInput"
        >
      </div>
    </div>

    <div v-if="daysToFinish && calculatedDailyGoal" class="field">
      <table class="table is-fullwidth">
        <tbody>
          <tr>
            <td><strong>{{ $t('start_page.daily_verse_count_goal.table_verses_in_bible') }}</strong></td>
            <td>{{ totalBibleVerses.toLocaleString() }}</td>
          </tr>
          <tr>
            <td><strong>{{ $t('start_page.daily_verse_count_goal.table_days_until_date') }}</strong></td>
            <td>{{ daysToFinish.toLocaleString() }}</td>
          </tr>
          <tr>
            <td><strong>{{ $t('start_page.daily_verse_count_goal.table_verses_per_day') }}</strong></td>
            <td>{{ calculatedDailyGoal.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
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
      <div class="control buttons">
        <button class="button" :disabled="isSaving" @click="handlePrevious">
          {{ previousButtonText }}
        </button>
        <button class="button is-info" :disabled="isSaving" @click="handleSubmit">
          {{ nextButtonText }}
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
      dailyVerseCountGoal: this.initialValue || 0,
      goalFinishDate: '',
      selectedOption: 'year',
      error: '',
      isSaving: false,
      isUpdatingFromOption: false,
    };
  },
  computed: {
    totalBibleVerses() {
      return TOTAL_BIBLE_VERSES;
    },
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
    selectedOption(newOption) {
      if (newOption !== 'specific') {
        this.isUpdatingFromOption = true;
        this.updateDateFromOption(newOption);
        this.$nextTick(() => {
          this.isUpdatingFromOption = false;
        });
      }
    },
    goalFinishDate(newDate) {
      if (newDate && this.calculatedDailyGoal && !this.isUpdatingFromOption) {
        this.dailyVerseCountGoal = this.calculatedDailyGoal;
      }
      // If date is manually changed and we're not updating from option, switch to specific
      if (newDate && !this.isUpdatingFromOption && this.selectedOption !== 'specific') {
        this.selectedOption = 'specific';
      }
    },
    calculatedDailyGoal(newGoal) {
      if (newGoal && !this.isUpdatingFromOption) {
        this.dailyVerseCountGoal = newGoal;
      }
    },
    initialValue(newValue) {
      if (newValue) {
        this.dailyVerseCountGoal = newValue;
      }
    },
  },
  mounted() {
    // Set initial date based on default option (year)
    this.updateDateFromOption('year');
  },
  methods: {
    updateDateFromOption(option) {
      const today = dayjs().startOf('day');
      let targetDate;

      switch (option) {
      case '2years':
        targetDate = today.add(2, 'year');
        break;
      case 'year':
        targetDate = today.add(1, 'year');
        break;
      case '6months':
        targetDate = today.add(6, 'month');
        break;
      default:
        return;
      }

      this.goalFinishDate = targetDate.format('YYYY-MM-DD');
    },
    handleDateInput() {
      // This will trigger the goalFinishDate watcher which will switch to 'specific'
      // if needed
    },
    handlePrevious() {
      this.$emit('previous');
    },
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
        "i_want_to": "Ich möchte...",
        "read_in_2_years": "Die Bibel in 2 Jahren lesen",
        "read_in_year": "Die Bibel in einem Jahr lesen",
        "read_in_6_months": "Die Bibel in 6 Monaten lesen",
        "read_by_specific_date": "Die Bibel bis zu einem bestimmten Datum lesen",
        "goal_finish_date": "Ziel-Fertigstellungsdatum",
        "daily_verse_count": "Tägliche Verszahl Ziel",
        "table_verses_in_bible": "Anzahl der Verse in der Bibel",
        "table_days_until_date": "Anzahl der Tage bis zum Datum",
        "table_verses_per_day": "Erforderliche Verse pro Tag",
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
        "i_want_to": "I want to...",
        "read_in_2_years": "Read the Bible in 2 years",
        "read_in_year": "Read the Bible in a year",
        "read_in_6_months": "Read the Bible in 6 months",
        "read_by_specific_date": "Read the Bible by a specific date",
        "goal_finish_date": "Goal Finish Date",
        "daily_verse_count": "Daily Verse Count Goal",
        "table_verses_in_bible": "Number of verses in Bible",
        "table_days_until_date": "Number of days until date",
        "table_verses_per_day": "Verses required per day",
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
        "i_want_to": "Quiero...",
        "read_in_2_years": "Leer la Biblia en 2 años",
        "read_in_year": "Leer la Biblia en un año",
        "read_in_6_months": "Leer la Biblia en 6 meses",
        "read_by_specific_date": "Leer la Biblia para una fecha específica",
        "goal_finish_date": "Fecha de Finalización del Objetivo",
        "daily_verse_count": "Meta de Versículos Diarios",
        "table_verses_in_bible": "Número de versículos en la Biblia",
        "table_days_until_date": "Número de días hasta la fecha",
        "table_verses_per_day": "Versículos requeridos por día",
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
        "i_want_to": "Je veux...",
        "read_in_2_years": "Lire la Bible en 2 ans",
        "read_in_year": "Lire la Bible en un an",
        "read_in_6_months": "Lire la Bible en 6 mois",
        "read_by_specific_date": "Lire la Bible à une date spécifique",
        "goal_finish_date": "Date de fin de l'objectif",
        "daily_verse_count": "Objectif de nombre de versets quotidiens",
        "table_verses_in_bible": "Nombre de versets dans la Bible",
        "table_days_until_date": "Nombre de jours jusqu'à la date",
        "table_verses_per_day": "Versets requis par jour",
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
        "i_want_to": "Eu quero...",
        "read_in_2_years": "Ler a Bíblia em 2 anos",
        "read_in_year": "Ler a Bíblia em um ano",
        "read_in_6_months": "Ler a Bíblia em 6 meses",
        "read_by_specific_date": "Ler a Bíblia até uma data específica",
        "goal_finish_date": "Data de Conclusão do Objetivo",
        "daily_verse_count": "Meta Diária de Versículos",
        "table_verses_in_bible": "Número de versículos na Bíblia",
        "table_days_until_date": "Número de dias até a data",
        "table_verses_per_day": "Versículos necessários por dia",
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
        "i_want_to": "Я хочу...",
        "read_in_2_years": "Прочитати Біблію за 2 роки",
        "read_in_year": "Прочитати Біблію за рік",
        "read_in_6_months": "Прочитати Біблію за 6 місяців",
        "read_by_specific_date": "Прочитати Біблію до певної дати",
        "goal_finish_date": "Дата завершення мети",
        "daily_verse_count": "Мета щоденної кількості віршів",
        "table_verses_in_bible": "Кількість віршів у Біблії",
        "table_days_until_date": "Кількість днів до дати",
        "table_verses_per_day": "Потрібно віршів на день",
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
