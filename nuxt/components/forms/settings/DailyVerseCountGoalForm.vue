<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.daily_verse_count_goal.title') }}
    </h2>
    <div class="content">
      <p>
        {{ $t('start_page.daily_verse_count_goal.description') }}
      </p>

      <h3 class="title is-6">
        {{ $t('start_page.daily_verse_count_goal.i_want_to') }}
      </h3>
    </div>

    <div class="option-cards">
      <!-- Read in 1 year -->
      <div class="option-card" :class="{ 'is-selected': selectedOption === 'year' }" @click="selectedOption = 'year'">
        <div class="option-card-radio">
          <input v-model="selectedOption" type="radio" value="year" @click.stop>
        </div>
        <div class="option-card-content">
          <div class="option-card-title">
            {{ $t('start_page.daily_verse_count_goal.read_in_year') }}
          </div>
          <div class="option-card-details">
            <div class="detail-row">
              <span class="detail-label">{{ $t('start_page.daily_verse_count_goal.daily_verse_count') }}:</span>
              <span class="detail-value">{{ getDailyGoalForOption('year').toLocaleString() }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ $t('start_page.daily_verse_count_goal.finish_on') }}:</span>
              <span class="detail-value">{{ getFinishDateForOption('year') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Read by specific date -->
      <div class="option-card" :class="{ 'is-selected': selectedOption === 'specific' }" @click="selectedOption = 'specific'">
        <div class="option-card-radio">
          <input v-model="selectedOption" type="radio" value="specific" @click.stop>
        </div>
        <div class="option-card-content">
          <div class="option-card-title">
            {{ $t('start_page.daily_verse_count_goal.read_by_specific_date') }}
          </div>
          <div class="option-card-details">
            <div class="detail-row">
              <label class="detail-label">{{ $t('start_page.daily_verse_count_goal.goal_finish_date') }}:</label>
              <input
                v-model="goalFinishDate"
                class="input detail-input"
                type="date"
                :min="minDate"
                :disabled="selectedOption !== 'specific'"
                @input="handleDateInput"
                @click.stop
              >
            </div>
            <div v-if="calculatedDailyGoal" class="detail-row">
              <span class="detail-label">{{ $t('start_page.daily_verse_count_goal.daily_verse_count') }}:</span>
              <span class="detail-value">{{ calculatedDailyGoal.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Read at my own pace -->
      <div class="option-card" :class="{ 'is-selected': selectedOption === 'ownpace' }" @click="selectedOption = 'ownpace'">
        <div class="option-card-radio">
          <input v-model="selectedOption" type="radio" value="ownpace" @click.stop>
        </div>
        <div class="option-card-content">
          <div class="option-card-title">
            {{ $t('start_page.daily_verse_count_goal.read_at_own_pace') }}
          </div>
          <div class="option-card-details">
            <div class="detail-row">
              <label class="detail-label">{{ $t('start_page.daily_verse_count_goal.daily_verse_count') }}:</label>
              <input
                v-model.number="dailyVerseCountGoal"
                class="input detail-input"
                type="number"
                min="1"
                max="1111"
                :disabled="selectedOption !== 'ownpace'"
                @click.stop
              >
            </div>
            <div v-if="calculatedFinishDate" class="detail-row">
              <span class="detail-label">{{ $t('start_page.daily_verse_count_goal.finish_on') }}:</span>
              <span class="detail-value">{{ calculatedFinishDate }}</span>
            </div>
          </div>
        </div>
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
      if (this.selectedOption !== 'specific' || !this.daysToFinish || this.daysToFinish <= 0) {
        return null;
      }
      return Math.ceil(TOTAL_BIBLE_VERSES / this.daysToFinish);
    },
    calculatedFinishDate() {
      if (this.selectedOption !== 'ownpace' || !this.dailyVerseCountGoal || this.dailyVerseCountGoal <= 0) {
        return null;
      }
      const daysNeeded = Math.ceil(TOTAL_BIBLE_VERSES / this.dailyVerseCountGoal);
      const finishDate = dayjs().add(daysNeeded, 'day');
      return this.displayDate(finishDate.format('YYYY-MM-DD'));
    },
  },
  watch: {
    selectedOption(newOption) {
      // Update dailyVerseCountGoal and goalFinishDate based on selected option
      if (newOption === 'specific') {
        // If switching to specific, ensure we have a date
        if (!this.goalFinishDate) {
          this.updateDateFromOption('year');
        }
      }
      else if (newOption === 'ownpace') {
        // If switching to own pace, keep current dailyVerseCountGoal if valid
        if (!this.dailyVerseCountGoal || this.dailyVerseCountGoal < 1) {
          // Default to year goal if no valid value
          this.dailyVerseCountGoal = this.getDailyGoalForOption('year');
        }
      }
      else {
        // For preset options, update both date and goal
        this.updateDateFromOption(newOption);
        this.dailyVerseCountGoal = this.getDailyGoalForOption(newOption);
      }
    },
    goalFinishDate(newDate) {
      // When date changes in specific mode, update the daily goal
      if (newDate && this.selectedOption === 'specific' && this.calculatedDailyGoal) {
        this.dailyVerseCountGoal = this.calculatedDailyGoal;
      }
    },
    calculatedDailyGoal(newGoal) {
      // When calculated goal changes in specific mode, update dailyVerseCountGoal
      if (newGoal && this.selectedOption === 'specific') {
        this.dailyVerseCountGoal = newGoal;
      }
    },
    initialValue(newValue) {
      if (newValue) {
        this.dailyVerseCountGoal = newValue;
        // If we have an initial value, try to determine which option it matches
        if (!this.selectedOption || this.selectedOption === 'year') {
          const yearGoal = this.getDailyGoalForOption('year');
          const twoYearGoal = this.getDailyGoalForOption('2years');
          const sixMonthGoal = this.getDailyGoalForOption('6months');

          if (Math.abs(newValue - yearGoal) < Math.abs(newValue - twoYearGoal) &&
              Math.abs(newValue - yearGoal) < Math.abs(newValue - sixMonthGoal)) {
            this.selectedOption = 'year';
          }
          else if (Math.abs(newValue - twoYearGoal) < Math.abs(newValue - sixMonthGoal)) {
            this.selectedOption = '2years';
          }
          else if (Math.abs(newValue - sixMonthGoal) < 5) {
            this.selectedOption = '6months';
          }
          else {
            this.selectedOption = 'ownpace';
          }
        }
      }
    },
  },
  mounted() {
    // Set initial date and goal based on default option (year)
    this.updateDateFromOption('year');
    this.dailyVerseCountGoal = this.getDailyGoalForOption('year');
  },
  methods: {
    getDailyGoalForOption(option) {
      const today = dayjs().startOf('day');
      let days;

      switch (option) {
      case '2years':
        days = today.add(2, 'year').diff(today, 'day');
        break;
      case 'year':
        days = today.add(1, 'year').diff(today, 'day');
        break;
      case '6months':
        days = today.add(6, 'month').diff(today, 'day');
        break;
      default:
        return 0;
      }

      return Math.ceil(TOTAL_BIBLE_VERSES / days);
    },
    getFinishDateForOption(option) {
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
        return '';
      }

      return this.displayDate(targetDate.format('YYYY-MM-DD'));
    },
    displayDate(dateString) {
      const date = dayjs(dateString).toDate();
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return date.toLocaleDateString(this.$i18n.locale, options);
    },
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
      // Date input handler - the watcher will update the daily goal
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

<style scoped>
.option-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-card {
  display: flex;
  align-items: flex-start;
  border: 2px solid #dbdbdb;
  border-radius: 4px;
  padding: 1rem;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.option-card:hover {
  border-color: #3273dc;
  background-color: #f5f5f5;
}

.option-card.is-selected {
  border-color: #3273dc;
  background-color: #e8f4f8;
}

.option-card-radio {
  margin-right: 1rem;
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.option-card-radio input[type="radio"] {
  cursor: pointer;
}

.option-card-content {
  flex: 1;
  min-width: 0;
}

.option-card-title {
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.option-card-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.detail-label {
  font-weight: 500;
  min-width: fit-content;
}

.detail-value {
  color: #3273dc;
  font-weight: 600;
}

.detail-input {
  max-width: 200px;
  flex: 0 0 auto;
}

.detail-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

<i18n lang="json">
{
  "de": {
    "start_page": {
      "daily_verse_count_goal": {
        "title": "Tägliche Verszahl Ziel",
        "description": "Ihr Tägliches Verszahl-Ziel ist die Anzahl der Verse, die Sie jeden Tag lesen möchten. My Bible Log zeigt Ihnen Ihren Fortschritt zu diesem Ziel.",
        "i_want_to": "Ich möchte...",
        "read_in_2_years": "Die Bibel in 2 Jahren lesen",
        "read_in_year": "Die Bibel in einem Jahr lesen",
        "read_in_6_months": "Die Bibel in 6 Monaten lesen",
        "read_by_specific_date": "Die Bibel bis zu einem bestimmten Datum lesen",
        "read_at_own_pace": "In meinem eigenen Tempo lesen",
        "goal_finish_date": "Ziel-Fertigstellungsdatum",
        "finish_on": "Fertig am",
        "daily_verse_count": "Verse pro Tag zu lesen",
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
        "description": "Your Daily Verse Count Goal is the number of verses you want to read each day. My Bible Log will show your progress toward this goal.",
        "i_want_to": "I want to...",
        "read_in_2_years": "Read the Bible in 2 years",
        "read_in_year": "Read the Bible in a year",
        "read_in_6_months": "Read the Bible in 6 months",
        "read_by_specific_date": "Read the Bible by a specific date",
        "read_at_own_pace": "Read at my own pace",
        "goal_finish_date": "Goal Finish Date",
        "finish_on": "Finish on",
        "daily_verse_count": "Verses to read each day",
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
        "description": "Su Meta de Versículos Diarios es el número de versículos que desea leer cada día. My Bible Log mostrará su progreso hacia este objetivo.",
        "i_want_to": "Quiero...",
        "read_in_2_years": "Leer la Biblia en 2 años",
        "read_in_year": "Leer la Biblia en un año",
        "read_in_6_months": "Leer la Biblia en 6 meses",
        "read_by_specific_date": "Leer la Biblia para una fecha específica",
        "read_at_own_pace": "Leer a mi propio ritmo",
        "goal_finish_date": "Fecha de Finalización del Objetivo",
        "finish_on": "Terminar el",
        "daily_verse_count": "Versículos para leer cada día",
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
        "description": "Votre Objectif de nombre de versets quotidiens est le nombre de versets que vous souhaitez lire chaque jour. My Bible Log affichera vos progrès vers cet objectif.",
        "i_want_to": "Je veux...",
        "read_in_2_years": "Lire la Bible en 2 ans",
        "read_in_year": "Lire la Bible en un an",
        "read_in_6_months": "Lire la Bible en 6 mois",
        "read_by_specific_date": "Lire la Bible à une date spécifique",
        "read_at_own_pace": "Lire à mon propre rythme",
        "goal_finish_date": "Date de fin de l'objectif",
        "finish_on": "Terminer le",
        "daily_verse_count": "Versets à lire chaque jour",
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
        "description": "Sua Meta Diária de Versículos é o número de versículos que você deseja ler a cada dia. My Bible Log mostrará seu progresso em direção a este objetivo.",
        "i_want_to": "Eu quero...",
        "read_in_2_years": "Ler a Bíblia em 2 anos",
        "read_in_year": "Ler a Bíblia em um ano",
        "read_in_6_months": "Ler a Bíblia em 6 meses",
        "read_by_specific_date": "Ler a Bíblia até uma data específica",
        "read_at_own_pace": "Ler no meu próprio ritmo",
        "goal_finish_date": "Data de Conclusão do Objetivo",
        "finish_on": "Terminar em",
        "daily_verse_count": "Versículos para ler cada dia",
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
        "description": "Ваша Мета щоденної кількості віршів - це кількість віршів, яку ви хочете читати кожен день. My Bible Log покаже ваш прогрес до цієї мети.",
        "i_want_to": "Я хочу...",
        "read_in_2_years": "Прочитати Біблію за 2 роки",
        "read_in_year": "Прочитати Біблію за рік",
        "read_in_6_months": "Прочитати Біблію за 6 місяців",
        "read_by_specific_date": "Прочитати Біблію до певної дати",
        "read_at_own_pace": "Читати у своєму темпі",
        "goal_finish_date": "Дата завершення мети",
        "finish_on": "Завершити",
        "daily_verse_count": "Вірші для читання щодня",
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
