<template>
  <LoginUser />
</template>
<script lang="ts">
import LoginUser from '@/components/LoginUser.vue'
import { Component, Vue } from 'nuxt-property-decorator'
@Component({
  components: {
    LoginUser,
  },
})
export default class MyStore extends Vue {}
</script>
