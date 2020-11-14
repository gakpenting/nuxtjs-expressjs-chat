<template>
 <LoginAdmin />
</template>

<script lang="ts">
import LoginAdmin from '@/components/LoginAdmin.vue'
import { Component, Vue } from 'nuxt-property-decorator'
@Component({
  components: {
    LoginAdmin
  }
})
export default class MyStore extends Vue {

}
</script>
