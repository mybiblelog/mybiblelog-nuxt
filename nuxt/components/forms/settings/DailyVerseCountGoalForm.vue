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
import { useToastStore } from '~/stores/toast';
import { useUserSettingsStore } from '~/stores/user-settings';

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
      const success = await useUserSettingsStore().updateSettings({
        dailyVerseCountGoal: this.dailyVerseCountGoal,
      });

      if (success) {
        if (this.showToast) {
          const toastStore = useToastStore();
          toastStore.add({
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

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/forms/settings/DailyVerseCountGoalForm.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/forms/settings/DailyVerseCountGoalForm.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/forms/settings/DailyVerseCountGoalForm.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/forms/settings/DailyVerseCountGoalForm.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/forms/settings/DailyVerseCountGoalForm.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/forms/settings/DailyVerseCountGoalForm.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/forms/settings/DailyVerseCountGoalForm.json" />
