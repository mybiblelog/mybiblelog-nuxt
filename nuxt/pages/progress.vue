<template>
  <section class="section">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-two-thirds-tablet is-half-desktop">
          <header class="page-header">
            <h1 class="title">
              {{ $t('progress') }}
              <info-link :to="localePath('/about/page-features--progress')" />
            </h1>
            <nuxt-link class="button" :to="localePath('/books')">
              {{ $t('bible_books') }}
              <CaretRight style="margin-left: 0.2rem;" />
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
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import * as dayjs from 'dayjs';
import Bible from '@shared/bible';
import BusyBar from '@/components/BusyBar';
import InfoLink from '@/components/InfoLink';
import CaretRight from '@/components/svg/CaretRight';

export default {
  name: 'ProgressPage',
  components: {
    BusyBar,
    InfoLink,
    CaretRight,
  },
  data() {
    return {
      goalFinishDate: '',
      goalFinishDateError: '',
      daysToFinishByGoalFinishDate: '?',
      versesRequiredEachDayForGoal: '?',
    };
  },
  async fetch() {
    await this.$store.dispatch('loadUserData');
  },
  computed: {
    ...mapGetters({
      logEntries: 'log-entries/currentLogEntries',
      dateVerseCountsBusy: 'date-verse-counts/busy',
      getDateVerseCounts: 'date-verse-counts/getDateVerseCounts',
    }),
    ...mapState({
      userSettings: state => state['user-settings'].settings,
    }),
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
      this.$store.dispatch('date-verse-counts/cacheDateVerseCounts');
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
  head() {
    return {
      title: this.$t('progress'),
    };
  },
  middleware: ['auth'],
};
</script>

<style lang="scss">
td:nth-child(2) {
  white-space: pre;
}
</style>

<i18n lang="json">
{
  "de": {
    "progress": "Fortschritt",
    "bible_books": "Bücher der Bibel",
    "your_reading_settings": {
      "title": "Ihre Leseinstellungen",
      "description": "Diese Einstellungen werden verwendet, um Ihren Fortschritt zu berechnen und anzuzeigen.",
      "update_settings": "Einstellungen aktualisieren",
      "look_back_date": "Rückblickdatum",
      "daily_verse_count_goal": "Tägliche Verszahl-Ziel"
    },
    "your_progress_so_far": {
      "title": "Ihr Fortschritt bis jetzt",
      "total_bible_verses": "Gesamte Bibelverszahl",
      "verses_read": "Gelesene Verszahl",
      "verses_remaining": "Verbleibende Verszahl",
      "percent_complete": "Fortschritt in Prozent"
    },
    "your_outlook": {
      "historical": {
        "title": "Ihre historische Perspektive",
        "description": "Basierend auf Ihren Lesegewohnheiten seit Ihrem <strong>Rückblickdatum</strong>, wie lange wird es dauern, bis Sie die Bibel lesen?"
      },
      "30_day": {
        "title": "Ihre 30-Tage-Perspektive",
        "description": "Basierend auf Ihren Lesegewohnheiten der letzten 30 Tage, wie lange wird es dauern, bis Sie die Bibel lesen?"
      },
      "7_day": {
        "title": "Ihre 7-Tage-Perspektive",
        "description": "Basierend auf Ihren Lesegewohnheiten der letzten 7 Tage, wie lange wird es dauern, bis Sie die Bibel lesen?"
      },
      "today": {
        "title": "Ihre heutige Perspektive",
        "description": "Basierend auf Ihrer heutigen Lesegewohnheit, wie lange wird es dauern, bis Sie die Bibel lesen?"
      },
      "days_since_look_back_date": "Tage seit <strong>Rückblickdatum<strong>",
      "verses_read": "Gelesene Verszahl",
      "average_daily_verses_read": "Durchschnittliche tägliche Verszahl",
      "days_to_finish_at_this_rate": "Tage bis zum Erreichen dieses Rhythmus",
      "date_to_finish_at_this_rate": "Datum bis zum Erreichen dieses Rhythmus"
    },
    "set_a_goal": {
      "title": "Ziel setzen",
      "description": "Wählen Sie ein Zieldatum, um die Bibel zu lesen, und arbeiten Sie rückwärts, um zu sehen, wie viele Verszahl Sie jeden Tag lesen müssen.",
      "goal_finish_date": "Ziel-Enddatum",
      "goal_finish_date_error": "Das Zieldatum muss in der Zukunft liegen.",
      "days_to_finish_by_goal": "Tage bis zum Erreichen des Ziels",
      "verses_required_each_day": "Verszahl pro Tag"
    },
    "never": "Nie"
  },
  "en": {
    "progress": "Progress",
    "bible_books": "Bible Books",
    "your_reading_settings": {
      "title": "Your Reading Settings",
      "description": "These settings are used to calculate and display your progress.",
      "update_settings": "Update Settings",
      "look_back_date": "Look Back Date",
      "daily_verse_count_goal": "Daily Verse Count Goal"
    },
    "your_progress_so_far": {
      "title": "Your Progress So Far",
      "total_bible_verses": "Total Bible Verses",
      "verses_read": "Verses Read",
      "verses_remaining": "Verses Remaining",
      "percent_complete": "Percent Complete"
    },
    "your_outlook": {
      "historical": {
        "title": "Your Historical Outlook",
        "description": "Based on your reading habits since your <strong>Look Back Date</strong>, how long will it take you to finish the Bible?"
      },
      "30_day": {
        "title": "Your 30-Day Outlook",
        "description": "Based on your reading habits from the past 30 days, how long will it take you to finish the Bible?"
      },
      "7_day": {
        "title": "Your 7-Day Outlook",
        "description": "Based on your reading habits from the past 7 days, how long will it take you to finish the Bible?"
      },
      "today": {
        "title": "Today's Outlook",
        "description": "Based on your reading today, how long will it take you to finish the Bible?"
      },
      "days_since_look_back_date": "Days Since <strong>Look Back Date<strong>",
      "verses_read": "Verses Read",
      "average_daily_verses_read": "Average Daily Verses Read",
      "days_to_finish_at_this_rate": "Days to Finish at This Rate",
      "date_to_finish_at_this_rate": "Date to Finish at This Rate"
    },
    "set_a_goal": {
      "title": "Set a Goal",
      "description": "Choose a target date to finish reading the Bible and work backwards to see how many verses you will need to read each day.",
      "goal_finish_date": "Goal Finish Date",
      "goal_finish_date_error": "Goal date must be in the future.",
      "days_to_finish_by_goal": "Days to Finish by Goal",
      "verses_required_each_day": "Verses Required Each Day"
    },
    "never": "Never"
  },
  "es": {
    "progress": "Progreso",
    "bible_books": "Libros de la Biblia",
    "your_reading_settings": {
      "title": "Sus Configuraciones de Lectura",
      "description": "Estas configuraciones se utilizan para calcular y mostrar su progreso.",
      "update_settings": "Actualizar Configuraciones",
      "look_back_date": "Fecha de Revisión",
      "daily_verse_count_goal": "Meta de Versos Diarios"
    },
    "your_progress_so_far": {
      "title": "Su Progreso Hasta Ahora",
      "total_bible_verses": "Total de Versos de la Biblia",
      "verses_read": "Versos Leídos",
      "verses_remaining": "Versos Restantes",
      "percent_complete": "Porcentaje Completado"
    },
    "your_outlook": {
      "historical": {
        "title": "Su Perspectiva Histórica",
        "description": "Basado en sus hábitos de lectura desde su <strong>Fecha de Revisión</strong>, ¿cuánto tiempo le tomará terminar la Biblia?"
      },
      "30_day": {
        "title": "Su Perspectiva de 30 Días",
        "description": "Basado en sus hábitos de lectura de los últimos 30 días, ¿cuánto tiempo le tomará terminar la Biblia?"
      },
      "7_day": {
        "title": "Su Perspectiva de 7 Días",
        "description": "Basado en sus hábitos de lectura de los últimos 7 días, ¿cuánto tiempo le tomará terminar la Biblia?"
      },
      "today": {
        "title": "La Perspectiva de Hoy",
        "description": "Basado en su lectura de hoy, ¿cuánto tiempo le tomará terminar la Biblia?"
      },
      "days_since_look_back_date": "Días Desde <strong>Fecha de Revisión<strong>",
      "verses_read": "Versos Leídos",
      "average_daily_verses_read": "Promedio de Versos Leídos Diariamente",
      "days_to_finish_at_this_rate": "Días para Terminar a Este Ritmo",
      "date_to_finish_at_this_rate": "Fecha para Terminar a Este Ritmo"
    },
    "set_a_goal": {
      "title": "Establecer una Meta",
      "description": "Elija una fecha objetivo para terminar de leer la Biblia y trabaje hacia atrás para ver cuántos versos deberá leer cada día.",
      "goal_finish_date": "Fecha de Finalización de la Meta",
      "goal_finish_date_error": "La fecha de finalización de la meta debe ser en el futuro.",
      "days_to_finish_by_goal": "Días para Terminar por Meta",
      "verses_required_each_day": "Versos Requeridos Cada Día"
    },
    "never": "Nunca"
  },
  "fr": {
    "progress": "Progrès",
    "bible_books": "Livres de la Bible",
    "your_reading_settings": {
      "title": "Vos paramètres de lecture",
      "description": "Ces paramètres sont utilisés pour calculer et afficher votre progression.",
      "update_settings": "Mettre à jour les paramètres",
      "look_back_date": "Date de consultation précédente",
      "daily_verse_count_goal": "Objectif de versets quotidiens"
    },
    "your_progress_so_far": {
      "title": "Votre progression jusqu'à présent",
      "total_bible_verses": "Total des versets de la Bible",
      "verses_read": "Versets lus",
      "verses_remaining": "Versets Restants",
      "percent_complete": "Pourcentage Complet"
    },
    "your_outlook": {
      "historical": {
        "title": "Votre Perspective Historique",
        "description": "En fonction de vos habitudes de lecture depuis votre <strong>Date de Réflexion</strong>, combien de temps vous faudra-t-il pour finir la Bible?"
      },
      "30_day": {
        "title": "Votre Perspective sur 30 Jours",
        "description": "En fonction de vos habitudes de lecture des 30 derniers jours, combien de temps vous faudra-t-il pour finir la Bible?"
      },
      "7_day": {
        "title": "Votre Perspective sur 7 Jours",
        "description": "En fonction de vos habitudes de lecture des 7 derniers jours, combien de temps vous faudra-t-il pour finir la Bible?"
      },
      "today": {
        "title": "Perspective du Jour",
        "description": "En fonction de votre lecture aujourd'hui, combien de temps vous faudra-t-il pour finir la Bible?"
      },
      "days_since_look_back_date": "Jours depuis la <strong>date de réexamen</strong>",
      "verses_read": "Versets lus",
      "average_daily_verses_read": "Moyenne des versets lus par jour",
      "days_to_finish_at_this_rate": "Jours restants à ce rythme",
      "date_to_finish_at_this_rate": "Date de fin à ce rythme"
    },
    "set_a_goal": {
      "title": "Fixer un objectif",
      "description": "Choisissez une date cible pour terminer la lecture de la Bible et travaillez en sens inverse pour voir combien de versets vous devrez lire chaque jour.",
      "goal_finish_date": "Date d'achèvement de l'objectif",
      "goal_finish_date_error": "La date de l'objectif doit être à l'avenir.",
      "days_to_finish_by_goal": "Jours pour terminer avant l'objectif",
      "verses_required_each_day": "Versets requis chaque jour"
    },
    "never": "Jamais"
  },
  "pt": {
    "progress": "Progress",
    "bible_books": "Bible Books",
    "your_reading_settings": {
      "title": "Suas Configurações de Leitura",
      "description": "Essas configurações são usadas para calcular e exibir seu progresso.",
      "update_settings": "Atualizar Configurações",
      "look_back_date": "Data de Revisão",
      "daily_verse_count_goal": "Meta Diária de Versículos"
    },
    "your_progress_so_far": {
      "title": "Seu Progresso Até Agora",
      "total_bible_verses": "Total de Versículos da Bíblia",
      "verses_read": "Versículos Lidos",
      "verses_remaining": "Versículos Restantes",
      "percent_complete": "Percentual Concluído"
    },
    "your_outlook": {
      "historical": {
        "title": "Seu Histórico de Progresso",
        "description": "Com base nos seus hábitos de leitura desde sua <strong>Data de Revisão</strong>, quanto tempo levará para você terminar a Bíblia?"
      },
      "30_day": {
        "title": "Seu Progresso em 30 Dias",
        "description": "Com base nos seus hábitos de leitura nos últimos 30 dias, quanto tempo levará para você terminar a Bíblia?"
      },
      "7_day": {
        "title": "Seu Progresso em 7 Dias",
        "description": "Com base nos seus hábitos de leitura nos últimos 7 dias, quanto tempo levará para você terminar a Bíblia?"
      },
      "today": {
        "title": "Progresso de Hoje",
        "description": "Com base na sua leitura hoje, quanto tempo levará para você terminar a Bíblia?"
      },
      "days_since_look_back_date": "Dias Desde a <strong>Data de Observação</strong>",
      "verses_read": "Versículos Lidos",
      "average_daily_verses_read": "Média Diária de Versículos Lidos",
      "days_to_finish_at_this_rate": "Dias para Terminar a Este Ritmo",
      "date_to_finish_at_this_rate": "Data de Conclusão a Este Ritmo"
    },
    "set_a_goal": {
      "title": "Definir um Objetivo",
      "description": "Escolha uma data alvo para terminar a leitura da Bíblia e trabalhe retroativamente para ver quantos versículos você precisará ler a cada dia.",
      "goal_finish_date": "Data de Conclusão do Objetivo",
      "goal_finish_date_error": "A data do objetivo deve estar no futuro.",
      "days_to_finish_by_goal": "Dias para Concluir até o Objetivo",
      "verses_required_each_day": "Versículos Requeridos por Dia"
    },
    "never": "Nunca"
  },
  "uk": {
    "progress": "Прогрес",
    "bible_books": "Книги Біблії",
    "your_reading_settings": {
      "title": "Ваші налаштування читання",
      "description": "Ці налаштування використовуються для розрахунку та відображення вашого прогресу.",
      "update_settings": "Оновити налаштування",
      "look_back_date": "Дата перегляду",
      "daily_verse_count_goal": "Щоденна ціль кількості віршів"
    },
    "your_progress_so_far": {
      "title": "Ваш прогрес на даний момент",
      "total_bible_verses": "Загальна кількість віршів у Біблії",
      "verses_read": "Прочитані вірші",
      "verses_remaining": "Залишилося віршів",
      "percent_complete": "Відсоток завершення"
    },
    "your_outlook": {
      "historical": {
        "title": "Ваш історичний прогляд",
        "description": "На основі ваших звичок читання з дня вашого <strong>перегляду дати</strong>, скільки часу вам знадобиться, щоб закінчити Біблію?"
      },
      "30_day": {
        "title": "Ваш прогляд за 30 днів",
        "description": "На основі ваших звичок читання з останніх 30 днів, скільки часу вам знадобиться, щоб закінчити Біблію?"
      },
      "7_day": {
        "title": "Ваш прогляд за 7 днів",
        "description": "На основі ваших звичок читання з останніх 7 днів, скільки часу вам знадобиться, щоб закінчити Біблію?"
      },
      "today": {
        "title": "Прогляд на сьогодні",
        "description": "На основі вашого сьогоднішнього читання, скільки часу вам знадобиться, щоб закінчити Біблію?"
      },
      "days_since_look_back_date": "Днів з перегляду",
      "verses_read": "Прочитані вірші",
      "average_daily_verses_read": "Середня кількість віршів за день",
      "days_to_finish_at_this_rate": "Днів до закінчення за цією швидкістю",
      "date_to_finish_at_this_rate": "Дата закінчення за цією швидкістю"
    },
    "set_a_goal": {
      "title": "Встановіть ціль",
      "description": "Оберіть цільову дату для завершення читання Біблії та працюйте в зворотному напрямку, щоб побачити, скільки віршів вам потрібно читати щодня.",
      "goal_finish_date": "Дата завершення цілі",
      "goal_finish_date_error": "Дата цілі повинна бути в майбутньому.",
      "days_to_finish_by_goal": "Днів до завершення за ціллю",
      "verses_required_each_day": "Віршів потрібно щодня"
    },
    "never": "Ніколи"
  }
}
</i18n>
