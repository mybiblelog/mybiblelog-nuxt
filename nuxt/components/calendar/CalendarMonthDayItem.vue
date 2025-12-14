<template>
  <li class="calendar-day" :class="calendarDayClass" @click="onClick">
    <div class="date">
      {{ label }}
    </div>
    <star-icon v-if="primaryPercentage && primaryPercentage >= 100" class="star" width="35%" height="35%" fill="#ffd700" />
    <star-icon v-else-if="secondaryPercentage && secondaryPercentage >= 100" class="star" width="35%" height="35%" fill="#0077bb" />
    <div v-if="day.isCurrentMonth" class="progress-bar">
      <div class="progress-bar-fill secondary" :style="secondaryProgressBarFillStyle" />
      <div class="progress-bar-fill" :style="primaryProgressBarFillStyle" />
    </div>
  </li>
</template>

<script>
import dayjs from 'dayjs';
import StarIcon from '@/components/svg/StarIcon';

export default {
  name: 'CalendarMonthDayItem',
  components: {
    StarIcon,
  },
  props: {
    day: {
      type: Object,
      required: true,
    },
    isCurrentMonth: {
      type: Boolean,
      default: false,
    },
    isToday: {
      type: Boolean,
      default: false,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    primaryPercentage: {
      type: Number,
      default: 0,
    },
    secondaryPercentage: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    label() {
      return dayjs(this.day.date).format('D');
    },
    calendarDayClass() {
      return {
        'calendar-day--not-current': !this.day.isCurrentMonth,
        'calendar-day--today': this.isToday,
        'calendar-day--selected': this.isSelected,
      };
    },
    primaryProgressBarFillStyle() {
      return {
        width: this.primaryPercentage + '%',
      };
    },
    secondaryProgressBarFillStyle() {
      return {
        width: this.secondaryPercentage + '%',
      };
    },
  },
  methods: {
    onClick() {
      if (this.day.isCurrentMonth) {
        this.$emit('daySelected', this.day.date);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$day-label-size: 20px;

.calendar-day {
  position: relative;
  min-height: 70px;
  font-size: 16px;
  background-color: #fff;
  color: $grey-800;
  padding: 5px;
  cursor: pointer;
  user-select: none;
  transition: 0.2s ease-out;

  @media screen and (max-width: 768px) {
    min-height: calc(100vw / 7);
  }
}

.calendar-day:hover {
  background-color: #eee;
}

.calendar-day .star {
  position: absolute;
  top: 10%;
  right: 10%;
  @media screen and (max-width: 768px) {
    top: 5%;
    right: 5%;
  }
}

.calendar-day .date {
  position: absolute;
  left: 5%;
  top: 5%;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
  @media screen and (max-width: 768px) {
    top: 5%;
    left: 5%;
    width: 1.5rem;
    height: 1.5rem;
  }
}

.calendar-day--not-current {
  color: $grey-300;
  transition: 0s;
  &,
  &:hover {
    background-color: $grey-100;
  }
}

.calendar-day--today .date {
  background-color: $grey-200;
}

.calendar-day--selected .date {
  color: #fff;
  background-color: #09f;
}

.calendar-day .progress-bar {
  position: absolute;
  bottom: 2px;
  left: 2px;
  right: 2px;
  height: 5px;
  background: #000;
  border-radius: 3px;
  overflow: hidden;

  .progress-bar-fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: #09f;

    &.secondary {
      background: #0077bb;
    }
  }
}
</style>
