<template>
  <div>
    <h4 class="text-h6 mb-4">Nutrition Information</h4>
    <v-row>
      <v-col
        v-for="(value, key) in nutrition.per_serving"
        :key="key"
        cols="6"
        sm="4"
        md="3"
      >
        <template v-if="!editable">
          <v-card variant="outlined">
            <v-card-text>
              <div class="text-caption">{{ formatNutritionKey(key) }}</div>
              <div class="text-h6">{{ value }}</div>
            </v-card-text>
          </v-card>
        </template>
        <template v-else>
          <v-text-field
            v-model="nutrition.per_serving[key]"
            :label="formatNutritionKey(key)"
            type="number"
            required
          ></v-text-field>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
defineProps({
  nutrition: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const formatNutritionKey = (key) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script> 