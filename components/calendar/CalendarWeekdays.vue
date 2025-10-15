<template>
  <ol class="day-of-week">
    <li v-for="weekday in weekdays" :key="weekday">
      {{ weekday }}
    </li>
  </ol>
</template>

<script>
export default {
  name: 'CalendarWeekdays',
  computed: {
    weekdays() {
      const locale = this.$i18n.locale;
      const options = { weekday: 'short' };

      // An array containing the localized names of the days of the week,
      // going from Monday to Sunday (getDay() returns 0 for Sunday).
      const weekdays = [
        new Date(2000, 1, 7).toLocaleDateString(locale, options),
        new Date(2000, 1, 1).toLocaleDateString(locale, options),
        new Date(2000, 1, 2).toLocaleDateString(locale, options),
        new Date(2000, 1, 3).toLocaleDateString(locale, options),
        new Date(2000, 1, 4).toLocaleDateString(locale, options),
        new Date(2000, 1, 5).toLocaleDateString(locale, options),
        new Date(2000, 1, 6).toLocaleDateString(locale, options),
      ];
      return weekdays;
    },
  },
};
</script>

<style lang="scss" scoped>
.day-of-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day-of-week > * {
  text-align: center;
}
</style>
