<template>
  <section class="hero is-primary is-fullheight">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-12-tablet is-12-desktop is-12-widescreen">
            <Message
              @logout="logout"
              :messages="messages"
              @send-message="send"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Message from '@/components/chat-component/Message.vue'
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import Cookies from 'js-cookie'
import  {io}  from 'socket.io-client'
@Component({
  components: {
    Message,
  },
})
export default class ChatUser extends Vue {
  public ws: any
  public messages: Array<object> = []
  public socket: any
  logout() {
    Cookies.remove('token')
    this.$router.push('/login_admin')
  }
  mounted() {
    if (!Cookies.get('token')) this.$router.push('/login_admin')
    this.socket = io(<string>process.env.baseUrl)
    let ini = this
    this.socket.on('chat message', (msg: object) => {
      ini.messages.push(msg)
    })
  }
  send(message: string): void {
    const badWords=/a+s+s+h+o+l+e+|b+i+t+c+h+/ig;
    this.socket.emit('chat message', {
      username: 'ADMIN',
      message:message.replace(badWords,"******"),
      token: Cookies.get('token'),
    })
  }
}
</script>
