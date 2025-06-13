<template>
  <v-card>
    <v-card-text>
      <div class="d-flex flex-column flex-sm-row align-center justify-space-between gap-4">
        <div class="d-flex align-center gap-2">
          <v-btn @click="$emit('previous')" variant="outlined" size="small">
            Previous
          </v-btn>
          <v-btn @click="$emit('next')" variant="outlined" size="small">
            Next
          </v-btn>
        </div>

        <div class="d-flex flex-column flex-sm-row align-center gap-2">
          <v-btn
            @click="$emit('current')"
            variant="text"
            :color="isCurrentWeek ? 'primary' : undefined"
            size="small"
          >
            This Week
          </v-btn>
          <div class="text-subtitle-1 text-sm-h6 text-center">
            {{ format(parseDate(startDate), 'MMM d') }} - {{ format(parseDate(endDate), 'MMM d, yyyy') }}
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { format } from 'date-fns'

defineProps({
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  isCurrentWeek: {
    type: Boolean,
    default: false
  }
})

defineEmits(['previous', 'next', 'current'])

// Helper function to parse dates consistently
const parseDate = (dateInput) => {
  if (dateInput instanceof Date) {
    return dateInput
  }
  const [year, month, day] = dateInput.split('-')
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}
</script> 