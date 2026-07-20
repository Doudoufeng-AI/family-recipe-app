<template>
  <RecipeForm @saved="onSaved" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import RecipeForm from './Form.vue'

const router = useRouter()
function onSaved(data) { router.push(`/recipe/${data.id}`) }
</script>
