<template>
  <div class="content-column">
    <header class="page-header">
      <h1 class="title">
        {{ $t('progress') }}
        <info-link :to="localePath('/about/page-features--progress')" />
      </h1>
      <nuxt-link class="button" :to="localePath('/books')">
        {{ $t('bible_books') }}
        <caret-right-icon style="margin-left: 0.2rem;" />
      </nuxt-link>
    </header>
    <busy-bar :busy="dateVerseCountsBusy" />
    <article class="message">
      <div class="message-body">
        <div class="content">
          <h2 class="title is-5">
            {{ $t('your_reading_settings.title') }}
          </h2>
          <p>{{ $t('your_reading_settings.description') }}</p>
          <div class="buttons">
            <nuxt-link class="button" :to="localePath('/settings/reading')">
              {{ $t('your_reading_settings.update_settings') }}
            </nuxt-link>
          </div>
          <table class="table">
            <tbody>
              <tr>
                <td>{{ $t('your_reading_settings.look_back_date') }}</td>
                <td>{{ displayDate(userSettings.lookBackDate) }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_reading_settings.daily_verse_count_goal') }}</td>
                <td>{{ userSettings.dailyVerseCountGoal }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>
    <article class="message">
      <div class="message-body">
        <div class="content">
          <h2 class="title is-5">
            {{ $t('your_progress_so_far.title') }}
          </h2>
          <table class="table">
            <tbody>
              <tr>
                <td>{{ $t('your_progress_so_far.total_bible_verses') }}</td>
                <td>{{ $n(totalBibleVerseCount, 'grouped') }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_progress_so_far.verses_read') }}</td>
                <td>{{ $n(uniqueVersesReadSinceLookBackDate, 'grouped') }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_progress_so_far.verses_remaining') }}</td>
                <td>{{ $n(unreadVerses, 'grouped') }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_progress_so_far.percent_complete') }}</td>
                <td>{{ $n(Math.floor(uniqueVersesReadSinceLookBackDate / totalBibleVerseCount * 100).toFixed() / 100, 'percent') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>
    <article class="message">
      <div class="message-body">
        <div class="content">
          <h2 class="title is-5">
            {{ $t('your_outlook.historical.title') }}
          </h2>
          <p v-html="$t('your_outlook.historical.description')" />
          <table class="table">
            <tbody>
              <tr>
                <td v-html="$t('your_outlook.days_since_look_back_date')" />
                <td>{{ $n(daysSinceLookBackDate, 'grouped') }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_outlook.average_daily_verses_read') }}</td>
                <td>{{ $n(averageUniqueVersesReadDailySinceLookBackDate, 'grouped') }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_outlook.days_to_finish_at_this_rate') }}</td>
                <td>{{ $n(daysToFinishBibleBasedOnLookBackDateAverage, 'grouped') }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_outlook.date_to_finish_at_this_rate') }}</td>
                <td>{{ displayDate(dateToFinishBibleBasedOnLookBackDateAverage) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>
    <article class="message">
      <div class="message-body">
        <div class="content">
          <h2 class="title is-5">
            {{ $t('your_outlook.30_day.title') }}
          </h2>
          <p>{{ $t('your_outlook.30_day.description') }}</p>
          <table class="table">
            <tbody>
              <tr>
                <td>{{ $t('your_outlook.average_daily_verses_read') }}</td>
                <td>{{ $n(averageDailyVersesReadPastXDays(30).toFixed(0), 'grouped') }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_outlook.days_to_finish_at_this_rate') }}</td>
                <td>{{ $n(daysToFinishBibleBasedOnXDayAverage(30), 'grouped') }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_outlook.date_to_finish_at_this_rate') }}</td>
                <td>{{ displayDate(dateToFinishBibleBasedOnXDayAverage(30)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>
    <article class="message">
      <div class="message-body">
        <div class="content">
          <h2 class="title is-5">
            {{ $t('your_outlook.7_day.title') }}
          </h2>
          <p>{{ $t('your_outlook.7_day.description') }}</p>
          <table class="table">
            <tbody>
              <tr>
                <td>{{ $t('your_outlook.average_daily_verses_read') }}</td>
                <td>{{ $n(averageDailyVersesReadPastXDays(7).toFixed(0), 'grouped') }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_outlook.days_to_finish_at_this_rate') }}</td>
                <td>{{ $n(daysToFinishBibleBasedOnXDayAverage(7), 'grouped') }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_outlook.date_to_finish_at_this_rate') }}</td>
                <td>{{ displayDate(dateToFinishBibleBasedOnXDayAverage(7)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>
    <article class="message">
      <div class="message-body">
        <div class="content">
          <h2 class="title is-5">
            {{ $t('your_outlook.today.title') }}
          </h2>
          <p>{{ $t('your_outlook.today.description') }}</p>
          <table class="table">
            <tbody>
              <tr>
                <td v-html="$t('your_outlook.verses_read')" />
                <td>{{ $n(newVersesReadToday, 'grouped') }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_outlook.days_to_finish_at_this_rate') }}</td>
                <td>{{ $n(daysToFinishBibleBasedOnToday, 'grouped') }}</td>
              </tr>
              <tr>
                <td>{{ $t('your_outlook.date_to_finish_at_this_rate') }}</td>
                <td>{{ displayDate(dateToFinishBibleBasedOnToday) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>
    <article class="message">
      <div class="message-body">
        <div class="content">
          <h2 class="title is-5">
            {{ $t('set_a_goal.title') }}
          </h2>
          <p>{{ $t('set_a_goal.description') }}</p>
          <table class="table">
            <tbody>
              <tr>
                <td colspan="2">
                  <label>{{ $t('set_a_goal.goal_finish_date') }}
                    <input v-model="goalFinishDate" class="input" type="date">
                  </label>
                </td>
              </tr>
              <tr v-if="goalFinishDateError">
                <td colspan="2">
                  <span class="has-text-danger">{{ goalFinishDateError }}</span>
                </td>
              </tr>
              <tr>
                <td>{{ $t('set_a_goal.days_to_finish_by_goal') }}</td>
                <td>{{ daysToFinishByGoalFinishDate }}</td>
              </tr>
              <tr>
                <td>{{ $t('set_a_goal.verses_required_each_day') }}</td>
                <td>{{ versesRequiredEachDayForGoal }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import * as dayjs from 'dayjs';
import { Bible } from '@mybiblelog/shared';
import BusyBar from '@/components/BusyBar';
import InfoLink from '@/components/InfoLink';
import CaretRightIcon from '@/components/svg/CaretRightIcon';
import { useLogEntriesStore } from '~/stores/log-entries';
import { useDateVerseCountsStore } from '~/stores/date-verse-counts';
import { useUserSettingsStore } from '~/stores/user-settings';
import { useAppInitStore } from '~/stores/app-init';

export default {
  name: 'ProgressPage',
  components: {
    BusyBar,
    InfoLink,
    CaretRightIcon,
  },
  middleware: ['auth'],
  data() {
    return {
      goalFinishDate: '',
      goalFinishDateError: '',
      daysToFinishByGoalFinishDate: '?',
      versesRequiredEachDayForGoal: '?',
    };
  },
  async fetch() {
    await useAppInitStore().loadUserData();
  },
  head() {
    return {
      title: this.$t('progress'),
    };
  },
  computed: {
    dateVerseCountsStore() {
      return useDateVerseCountsStore();
    },
    dateVerseCountsBusy() {
      return this.dateVerseCountsStore.busy;
    },
    getDateVerseCounts() {
      return this.dateVerseCountsStore.getDateVerseCounts;
    },
    logEntriesStore() {
      return useLogEntriesStore();
    },
    logEntries() {
      return this.logEntriesStore.currentLogEntries;
    },
    userSettingsStore() {
      return useUserSettingsStore();
    },
    userSettings() {
      return this.userSettingsStore.settings;
    },
    totalBibleVerseCount() {
      return Bible.getTotalVerseCount();
    },
    logEntriesForToday() {
      const today = dayjs().format('YYYY-MM-DD');
      return this.logEntries.filter(logEntry => logEntry.date === today).map(this.addNewVerseCount);
    },
    newVersesReadToday() {
      const today = dayjs().format('YYYY-MM-DD');
      const logEntriesThroughYesterday = this.logEntries.filter(logEntry => logEntry.date < today);
      const uniqueVersesThroughYesterday = Bible.countUniqueRangeVerses(logEntriesThroughYesterday);

      const logEntriesThroughToday = this.logEntries.filter(logEntry => logEntry.date <= today);
      const uniqueVersesThroughToday = Bible.countUniqueRangeVerses(logEntriesThroughToday);

      return uniqueVersesThroughToday - uniqueVersesThroughYesterday;
    },
    daysSinceLookBackDate() {
      const today = dayjs();
      const lookBackDate = dayjs(this.userSettings.lookBackDate);
      return today.diff(lookBackDate, 'day');
    },
    uniqueVersesReadSinceLookBackDate() {
      return Bible.countUniqueRangeVerses(this.logEntries);
    },
    averageUniqueVersesReadDailySinceLookBackDate() {
      return Math.floor(this.uniqueVersesReadSinceLookBackDate / this.daysSinceLookBackDate);
    },
    unreadVerses() {
      return this.totalBibleVerseCount - this.uniqueVersesReadSinceLookBackDate;
    },
    daysToFinishBibleBasedOnLookBackDateAverage() {
      const versesRemaining = this.unreadVerses;
      const dailyReadingAverage = this.averageUniqueVersesReadDailySinceLookBackDate;
      if (!dailyReadingAverage) {
        return Infinity;
      }
      const daysToFinish = versesRemaining / dailyReadingAverage;
      return Math.ceil(daysToFinish);
    },
    dateToFinishBibleBasedOnLookBackDateAverage() {
      const daysToFinish = this.daysToFinishBibleBasedOnLookBackDateAverage;
      if (daysToFinish === Infinity) {
        return 'Never';
      }
      const targetDate = dayjs().add(daysToFinish, 'day');
      return targetDate.format('YYYY-MM-DD');
    },
    daysToFinishBibleBasedOnToday() {
      const versesRemaining = this.unreadVerses;
      const dailyReadingAverage = this.newVersesReadToday;
      if (!dailyReadingAverage) {
        return Infinity;
      }
      const daysToFinish = versesRemaining / dailyReadingAverage;
      return Math.ceil(daysToFinish);
    },
    dateToFinishBibleBasedOnToday() {
      const daysToFinish = this.daysToFinishBibleBasedOnToday;
      if (daysToFinish === Infinity) {
        return 'Never';
      }
      const targetDate = dayjs().add(daysToFinish, 'day');
      return targetDate.format('YYYY-MM-DD');
    },
  },
  watch: {
    goalFinishDate(newGoalFinishDate) {
      const today = dayjs().startOf('day');
      const goalDate = dayjs(newGoalFinishDate).startOf('day');
      const difference = goalDate.diff(today, 'day');
      if (difference <= 0) {
        this.goalFinishDateError = this.$t('set_a_goal.goal_finish_date_error');
        this.daysToFinishByGoalFinishDate = '?';
        this.versesRequiredEachDayForGoal = '?';
        return;
      }
      this.daysToFinishByGoalFinishDate = this.$n(
        difference,
        'grouped',
      );
      this.versesRequiredEachDayForGoal = this.$n(
        Math.ceil(this.unreadVerses / difference),
        'grouped',
      );
      this.goalFinishDateError = '';
    },
  },
  mounted() {
    setTimeout(() => {
      // dispatch this long-running action in a timeout to prevent blocking
      this.dateVerseCountsStore.cacheDateVerseCounts();
    }, 0);
  },
  methods: {
    /**
     * This method differs from the `displayDate` shared across
     * the rest of the app, as this version excludes the weekday.
     */
    displayDate(dateString) {
      if (dateString === 'Never') {
        return this.$t('never');
      }
      const date = dayjs(dateString).toDate();
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      return date.toLocaleDateString(this.$i18n.locale, options);
    },
    averageDailyVersesReadPastXDays(x) {
      const today = dayjs();
      let targetDate = today.subtract(x, 'day');
      const lookBackDate = dayjs(this.userSettings.lookBackDate);
      if (targetDate.isBefore(lookBackDate)) {
        targetDate = lookBackDate;
      }
      const daysAgo = Math.abs(targetDate.diff(today, 'day'));

      let cumulativeUniqueVerses = 0;
      let currentDate = targetDate;
      while (currentDate.isBefore(today)) {
        const { unique } = this.getDateVerseCounts(currentDate.format('YYYY-MM-DD'));
        cumulativeUniqueVerses += unique;
        currentDate = currentDate.add(1, 'day');
      }
      const averageUniqueVerses = cumulativeUniqueVerses / daysAgo;
      return averageUniqueVerses;
    },
    daysToFinishBibleBasedOnXDayAverage(x) {
      const versesRemaining = this.unreadVerses;
      const dailyReadingAverage = this.averageDailyVersesReadPastXDays(x);
      if (!dailyReadingAverage) {
        return Infinity;
      }
      const daysToFinish = versesRemaining / dailyReadingAverage;
      return Math.ceil(daysToFinish);
    },
    dateToFinishBibleBasedOnXDayAverage(x) {
      const daysToFinish = this.daysToFinishBibleBasedOnXDayAverage(x);
      if (daysToFinish === Infinity) {
        return 'Never';
      }
      const targetDate = dayjs().add(daysToFinish, 'day');
      return targetDate.format('YYYY-MM-DD');
    },
  },
};
</script>

<style lang="scss">
td:nth-child(2) {
  white-space: pre;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/progress.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/progress.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/progress.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/progress.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/pages/progress.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/progress.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/progress.json" />
