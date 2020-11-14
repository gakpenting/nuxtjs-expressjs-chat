<template>
 <ChatUser />
</template>
<script lang="ts">
import ChatUser from '@/components/chat-component/ChatUser.vue'
import { Component, Vue } from 'nuxt-property-decorator'
@Component({
  components: {
    ChatUser
  }
})
export default class MyStore extends Vue {

}
</script>
