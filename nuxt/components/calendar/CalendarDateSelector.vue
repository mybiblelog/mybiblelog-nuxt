<template>
  <div class="calendar-date-selector">
    <span class="prev" @click="selectPrevious">
      <div class="icon" />
    </span>
    <span class="today" @click="selectCurrent">{{ $t('today') }}</span>
    <span class="next" @click="selectNext">
      <div class="icon" />
    </span>
  </div>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'CalendarDateSelector',
  props: {
    currentDate: {
      type: String,
      required: true,
    },
    selectedDate: {
      type: Object,
      required: true,
    },
  },
  methods: {
    selectPrevious() {
      const newSelectedDate = dayjs(this.selectedDate).subtract(1, 'month');
      this.$emit('dateSelected', newSelectedDate);
      this.$emit('daySelected', null);
    },
    selectCurrent() {
      const newSelectedDate = dayjs(this.currentDate);
      this.$emit('dateSelected', newSelectedDate);
      this.$emit('daySelected', dayjs().format('YYYY-MM-DD'));
    },
    selectNext() {
      const newSelectedDate = dayjs(this.selectedDate).add(1, 'month');
      this.$emit('dateSelected', newSelectedDate);
      this.$emit('daySelected', null);
    },
  },
};
</script>

<style lang="scss" scoped>
.calendar-date-selector {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  color: $grey-800;
  margin: 0 -1rem;
}

.calendar-date-selector > * {
  cursor: pointer;
  user-select: none;
}

.today {
  padding: 5px 0.5rem;
}

.prev,
.next {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
}

.prev .icon{
  width: 0;
  height: 0;
  border-left: 0;
  border-top: 0.5rem solid transparent;
  border-bottom: 0.5rem solid transparent;
  border-right: 1rem solid #ccc;
}

.next .icon {
  width: 0;
  height: 0;
  border-right: 0;
  border-top: 0.5rem solid transparent;
  border-bottom: 0.5rem solid transparent;
  border-left: 1rem solid #ccc;
}
</style>

<i18n lang="json">
{
  "de": {
    "today": "Heute"
  },
  "en": {
    "today": "Today"
  },
  "es": {
    "today": "Hoy"
  },
  "fr": {
    "today": "Aujourd'hui"
  },
  "pt": {
    "today": "Hoje"
  },
  "uk": {
    "today": "Сьогодні"
  }
}
</i18n>
