<template>
  <v-card
    class="h-100"
    @click="$emit('click')"
    hover
  >
    <v-card-text>
      <div class="d-flex justify-space-between align-start">
        <h3 class="text-h6 text-truncate">{{ meal.name }}</h3>
        <span class="text-caption">{{ format(parseDate(meal.date), 'EEE, MMM d') }}</span>
      </div>
      <p class="text-caption mt-2">{{ meal.time }}</p>
      <p class="mt-2 text-body-2">{{ meal.description }}</p>
      
      <div class="d-flex justify-space-between mt-4">
        <div class="text-caption">
          {{ meal.servings }} servings
        </div>
        <div class="text-caption">
          {{ meal.nutrition.per_serving.calories }} cal/serving
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { format } from 'date-fns'

defineProps({
  meal: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

// Helper function to parse dates consistently
const parseDate = (dateInput) => {
  if (dateInput instanceof Date) {
    return dateInput
  }
  const [year, month, day] = dateInput.split('-')
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}
</script> 