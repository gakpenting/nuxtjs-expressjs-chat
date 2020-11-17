# How To Create Chat App With Chatbot Using NuxtJs And Express

### Introduction

Today you gonna learn on how to create a chat application based on _nuxtjs_ and _expressjs_. _nuxtjs_ for the frontend, and also you will give some functionality like chatbot that can inform you about the situation of the covid 19 in the world today. It is hoped that after you finish running the tutorial below you can create your own chat application and add your own chatbot functionality as well.

## Prerequisites

To complete this tutorial, you will need:

- A local development environment for Node.js. Follow [How to Install Node.js and Create a Local Development Environment](https://www.digitalocean.com/community/tutorial_series/how-to-install-node-js-and-create-a-local-development-environment).
- A text editor like [Visual Studio Code](https://code.visualstudio.com/download) or [Atom](https://atom.io/).
- A web browser like [Firefox](https://www.mozilla.org/en-US/firefox/new/) or [Chrome](https://www.google.com/chrome/).
- Familiarity with JavaScript. You can look at the [How To Code in JavaScript](https://www.digitalocean.com/community/tutorial_series/how-to-code-in-javascript) series to learn more.
- Familiarity with Nuxtjs. You can take a look at Nuxtjs official documentation [here](https://nuxtjs.org/docs/2.x/get-started/installation).
- Familiarity with Vuejs. You can take a look at Vuejs official documentation [here](https://vuejs.org/v2/guide/).
- Familiarity with Typescript. You can take a look at Typescript official documentation [here](https://www.typescriptlang.org/).
- Familiarity with Nuxtjs Typescript. You can take a look at Nuxtjs Typescript official documentation [here](https://typescript.nuxtjs.org/).
- Docker, we will use docker to run our postgresql database you can install docker by following tutorial [here](https://docs.docker.com/get-docker/)
- Docker-compose, we will use docker-compose to run our postgresql database you can install docker-compose by following tutorial [here](https://docs.docker.com/compose/)
- Postgresql, we are gonna use postgresql as our main database you can take a look on how to use it [here](https://www.postgresql.org/docs/)

## Step 1 — Execute Postgresql Using Docker-Compose

First of all create a `docker-compose.yml` file and then add this line of code :

```yaml
# docker-compose.yml
version: "3"
services:
  database:
    image: "postgres"
    ports:
      - "5432:5432"
    env_file:
      - database.env
    volumes:
      - database-data:/var/lib/postgresql/data/
volumes:
  database-data:
```

and now create `database.env` file and fill it with this variable :

```env
# database.env
POSTGRES_USER=panda
POSTGRES_PASSWORD=panda1234
POSTGRES_DB=panda_database
```

what this yaml file does is, to tell docker to run service called `database` which run `postgres` image, and configure the environment variable using `database.env` after all that setup now run this command on the command line :

```bash
docker-compose up -d
```

now your postgresql database is running.

## Step 2 — Create An Expressjs Server

First create a `package.json` file then add this line :

```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index.js"
  },
  "dependencies": {
    "bcrypt": "^5.0.0",
    "body-parser": "^1.19.0",
    "bufferutil": "^4.0.2",
    "cors": "^2.8.5",
    "express": "^4.17.1",
    "jsonwebtoken": "^8.5.1",
    "pg": "^8.5.0",
    "sequelize": "^6.3.5",
    "socket.io": "^3.0.1",
    "axios": "^0.21.0"
  }
}
```

now run this command on the command line :

```bash
npm install
```

what this command does is installing all the dependencies that we define in the `package.json` file like expressjs, socket.io for the realtime and etc. After you install the dependencies now create `index.js` file and add this line of code :

```javascript
const PORT = process.env.PORT || 3000;
const express = require("express");
const server = express();
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
```

This is a really simple `expressjs` file what this does is, it just listen to the request to port 3000, if there is no `PORT` environment variable specified. Now we gonna add `sequelize` to our server in order for our server to connect to database now run this command :

```bash
npx sequelize init
```

What this command does is it create 4 necessary file and folders that we can use to connect to our postgresql database using sequelize. Now go to `config/config.json` file and change the development config to this one :

```json
  "development": {
    "username": "panda",
    "password": "panda1234",
    "database": "panda_database",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
```

It basically tell the server to login to database using this credentials. Now you need to create table in order for you to add authentication to your application, add the user table using this command :

```bash
npx sequelize model:create --name user --attributes username:string,password:string,token:string,role:string
```

Basically what this command does is it create a migration file, so that you can create a table in postgresql easily now run this command to create table :

```bash
npx sequelize db:migrate
```

Now after your table is created, you would want to add data to it, you can do so by adding a seeder file run this command to add a seeder file :

```bash
npx sequelize seed:generate --name users
```

This basically create a new file in `seeders` folder, open that file and write this code :

```javascript
"use strict";
const bcrypt = require("bcrypt");
const password = process.env.PASSWORD || "defaultpassword";
const username = process.env.USERNAME || "admin";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("users", [
      {
        username: username,
        password: await bcrypt.hash(password, 1),
        token: require("crypto").randomBytes(64).toString("hex"),
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("users", { username }, {});
  },
};
```

The code above is used to insert data into table `users` that you create earlier using migration. Now go to `index.js` again and add this line :

```javascript
const PORT = process.env.PORT || 3000;
const express = require("express");
const model = require("./models/index");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const server = express();
const http = require("http").createServer(server);
const cors = require("cors");
const jwt = require("jsonwebtoken");
server.use(cors());
server.use(express.static("public"));
server.post("/login", bodyParser.json(), async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = await model.User.findOne({ where: { username } });

    if (users) {
      const cek = await bcrypt.compare(password, users.password);
      if (cek) {
        const token = jwt.sign({ token: users.token }, process.env.SECRET);
        return res.json({
          status: true,
          messages: "OK",
          data: {
            username: users.username,
            role: users.role,
            token: token,
          },
        });
      } else {
        throw new Error("wrong pass");
      }
    } else {
      return res.json({
        status: false,
        messages: "EMPTY",
        data: {},
      });
    }
  } catch (err) {
    return res.json({
      status: false,
      messages: err.message,
      data: {},
    });
  }
});
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
```

What this code above does is, it create connection to database using `models/index.js` and then create a route `/login` to check whether our user is in the database or not, now you need to add `socket.io` for the chat feature.

```javascript
const PORT = process.env.PORT || 3000;
const express = require("express");
const model = require("./models/index");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const server = express();
const http = require("http").createServer(server);
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");
server.use(cors());
server.use(express.static("public"));
server.post("/login", bodyParser.json(), async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = await model.User.findOne({ where: { username } });

    if (users) {
      const cek = await bcrypt.compare(password, users.password);
      if (cek) {
        const token = jwt.sign({ token: users.token }, process.env.SECRET);
        return res.json({
          status: true,
          messages: "OK",
          data: {
            username: users.username,
            role: users.role,
            token: token,
          },
        });
      } else {
        throw new Error("wrong pass");
      }
    } else {
      return res.json({
        status: false,
        messages: "EMPTY",
        data: {},
      });
    }
  } catch (err) {
    return res.json({
      status: false,
      messages: err.message,
      data: {},
    });
  }
});
http.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connect", (socket) => {
  socket.on("chat message", (data) => {
    const { username, message } = data;
    if (data.token) {
      jwt.verify(data.token, process.env.SECRET, function (err, decoded) {
        let sendMessage = message;
        chatbot(io, sendMessage, "admin");
      });
    } else {
      let sendMessage = message;
      chatbot(io, sendMessage, username);
    }
  });
});
function chatbot(io, sendMessage, username) {
  if (/^coronabot\sconfirmed$/gi.test(sendMessage)) {
    axios.get("https://covid19.mathdro.id/api/").then((res) =>
      io.emit("chat message", {
        username,
        message: `confirmed in coronavirus case ${res.data.confirmed.value}`,
        role: username === "admin" ? "admin" : null,
      })
    );
  } else if (/^coronabot\srecovered$/gi.test(sendMessage)) {
    axios.get("https://covid19.mathdro.id/api/").then((res) =>
      io.emit("chat message", {
        username,
        message: `recovered in coronavirus case ${res.data.recovered.value}`,
        role: username === "admin" ? "admin" : null,
      })
    );
  } else if (/^coronabot\sdeaths$/gi.test(sendMessage)) {
    axios.get("https://covid19.mathdro.id/api/").then((res) =>
      io.emit("chat message", {
        username,
        message: `deaths in coronavirus case ${res.data.deaths.value}`,
        role: username === "admin" ? "admin" : null,
      })
    );
  } else if (/^coronabot\shelp$/gi.test(sendMessage)) {
    axios.get("https://covid19.mathdro.id/api/").then((res) =>
      io.emit("chat message", {
        username,
        message: `you can check the latest coronavirus case in the world by using this command:\n1. coronabot confirmed\n2. coronabot deaths\n3. coronabot recovered\nagain i just want to remind you to always wash your hand`,
        role: username === "admin" ? "admin" : null,
      })
    );
  } else {
    io.emit("chat message", {
      username,
      message: sendMessage,
      role: username === "admin" ? "admin" : null,
    });
  }
}
```

The `function chatbot` command above is used for our chatbot to notify the user using `socket.io` about the coronavirus case using api from open source project in [here](https://github.com/mathdroid/covid-19-api) that scrape the value of coronavirus case in JHU CSSE. After you create this `index.js` run this command :

```bash
SECRET=panda node index.js
```

`SECRET` here is used for adding secret for our jwt token you can change it whatever you want. After you succesfully run the server, now you can create nuxt typescript application.

## Step 3 — Create A Nuxt Typescript Application

Now after the server is done you can create the frontend app by using nuxt typescript. Why typescript because using typescript your nuxt code will be much more tidy and maintainable now run this command to create your nuxt application :

```bash
npx create-nuxt-app frontend
```

You will need to answer the question in order for you to create the nuxt application now follow this command one by one :

```bash
Project name: (frontend) 
Programming language: TypeScript
Package manager: Npm
UI framework: Buefy
Nuxt.js modules: Axios
Linting tools: ESLint, Prettier
Testing framework: Jest
Rendering mode: Single Page App
Deployment target: Static (Static/JAMStack hosting)
Development tools: Dependabot (For auto-updating dependencies, GitHub only)
Continuous integration: None
What is your GitHub username? #ENTER your username
Version control system: None
```
After that wait for it to complete, while waiting create a folder called `public` this is where your nuxtjs generated app resides. And you can also serve that in your nodejs server. Now go to `frontend/nuxt.config.js` and change the content to this :

```javascript
export default {
  ssr: false,
  // Global page headers (https://go.nuxtjs.dev/config-head)

  env: {
    baseUrl:
      process.env.NODE_ENV === 'prod'
        ? process.env.URL
        : 'http://localhost:3000',
  },
  head: {
    title: 'nuxt-chat-frontend',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/buefy
    'nuxt-buefy',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
  ],
  server: {
    port: 8000, // default: 3000
  },
  axios: {
    baseURL:   process.env.NODE_ENV === 'prod'
    ? process.env.URL
    : 'http://localhost:3000',
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {},
  generate: {
    dir: '../public',
  },
}

```
This will tell nuxt how you want your file to be generated later. After that now create file called `ts-shim.d.ts` in `frontend` folder, this file is used for telling code editor to index the `$axios` module so that you can access it anywhere in `.vue` file write this code below :

```javascript
import { NuxtAxiosInstance } from '@nuxtjs/axios'
declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
declare module '@nuxt/types' {
  interface Context {
    $axios: NuxtAxiosInstance
  }
}
```
after that in `tsconfig.json` add the types like this :

```javascript
 "types": [
      "@types/node",
      "@nuxt/types",
      "@nuxtjs/axios",
      "@types/js-cookie"
    ]
```
After that change the dependencies in `frontend/package.json` like this :

```json
"dependencies": {
    "@nuxt/typescript-runtime": "^2.0.0",
    "@nuxtjs/axios": "^5.12.2",
    "@nuxtjs/pwa": "^3.0.2",
    "@types/js-cookie": "^2.2.6",
    "@types/socket.io-client": "^1.4.34",
    "core-js": "^3.6.5",
    "js-cookie": "^2.2.1",
    "nuxt": "^2.14.6",
    "nuxt-buefy": "^0.4.3",
    "nuxt-property-decorator": "^2.8.8",
    "socket.io-client": "^3.0.1"
  },
```
And now run this command in `frontend` folder :

```bash
npm install
```
Change `frontend/layouts/default.vue` into this :

```vue
<template>
  <nuxt />
</template>
```

After that in `frontend/pages` folder create 4 files first file is called `index.vue` this is where our homepage resides, add this code :

```vue
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
```
Here you can see that your component above is extending another component called `LoginUser` you will create this later now you will focus on creating all 4 pages first now continue and create `login_admin.vue` file in `frontend/pages` folder add this below code :

```vue
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
```

create `chat_admin.vue` file in `frontend/pages` folder add this below code :

```vue
<template>
  <ChatAdmin />
</template>
<script lang="ts">
import ChatAdmin from '@/components/chat-component/ChatAdmin.vue'
import { Component, Vue } from 'nuxt-property-decorator'
@Component({
  components: {
    ChatAdmin
  }
})
export default class MyStore extends Vue {}
</script>
```
and finally create `chat.vue` file in `frontend/pages` folder and add this below code :

```vue
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

```
Now you need to add `components` in order for your pages above to work first create a file called `LoginUser.vue` in `frontend/components` folder and add this below code :

```vue
<template>
  <section class="hero is-primary is-fullheight">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-5-tablet is-4-desktop is-3-widescreen">
            <form @submit.prevent="logins" class="box">
              <div class="field">
                <label for="" class="label">Username</label>
                <div class="control has-icons-left">
                  <input
                    type="text"
                    placeholder="username"
                    class="input"
                    required
                    v-model="username"
                  />
                  <span class="icon is-small is-left">
                    <i class="fa fa-lock"></i>
                  </span>
                </div>
              </div>

              <div class="field">
                <button class="button is-success" @click="logins">Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ToastProgrammatic as Toast } from 'buefy'
import Cookies from 'js-cookie'

@Component
export default class MyStore extends Vue {
  public username: string = ''
  public password: string = ''
  public error: string = ''
  created() {
    if (Cookies.get('user')) this.$router.push('/chat')
  }
  async logins() {
    Cookies.set('user', this.username, { expires: 7 })
    this.$router.push('/chat')
  }
}
</script>
```
create a file called `LoginAdmin.vue` in `frontend/components` folder and add this below code :

```vue
<template>
  <section class="hero is-primary is-fullheight">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-5-tablet is-4-desktop is-3-widescreen">
            <form @submit.prevent="logins" class="box">
              <div class="field">
                <label for="" class="label">Username</label>
                <div class="control has-icons-left">
                  <input
                    v-model="username"
                    type="text"
                    placeholder="username"
                    class="input"
                    required
                  />
                  <span class="icon is-small is-left">
                    <i class="fa fa-envelope"></i>
                  </span>
                </div>
              </div>
              <div class="field">
                <label for="" class="label">Password</label>
                <div class="control has-icons-left">
                  <input
                    v-model="password"
                    type="password"
                    placeholder="*******"
                    class="input"
                    required
                  />
                  <span class="icon is-small is-left">
                    <i class="fa fa-lock"></i>
                  </span>
                </div>
              </div>

              <div class="field">
                <button type="button" class="button is-success" @click="logins">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ToastProgrammatic as Toast } from 'buefy'
import Cookies from 'js-cookie'

@Component
export default class MyStore extends Vue {
  public username: string = ''
  public password: string = ''
  public error: string = ''
  created() {
    if (Cookies.get('token')) this.$router.push('/chat_admin')
  }
  async logins() {
    try {
      const cek = await this.$axios.post('/login', {
        username: this.username,
        password: this.password,
      })
      if (!cek.data.status){
        return this.$buefy.toast.open({
          message: 'username or password wrong',
          type: 'is-warning',
        })}
      Cookies.set('token', cek.data.data.token, { expires: 7 })
      this.$router.push('/chat_admin')
    } catch (e) {
      this.$buefy.toast.open({
        message: 'username or password wrong',
        type: 'is-warning',
      })
      console.log(e.message)
    }
  }
}
</script>
```
create a folder called `chat-component` in `frontend/components` folder and create a file called `ChatAdmin.vue` in `frontend/components/chat-component` folder and add this below code :

```vue
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
```
create a file called `ChatUser.vue` in `frontend/components/chat-component` folder and add this below code :

```vue
<template>
  <section class="hero is-primary is-fullheight">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-12-tablet is-12-desktop is-12-widescreen">
            <Message @logout="logout" :messages="messages" @send-message="send" />
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
import  {io} from 'socket.io-client'

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
    Cookies.remove('user')
    this.$router.push('/')
  }
  created() {
    if (!Cookies.get('user')) this.$router.push('/')
    this.socket = io(<string>process.env.baseUrl)
    let ini = this
    this.socket.on('chat message', (msg:object) => {
      ini.messages.push(msg)
    })
  }
  send(message: string): void {
    const badWords=/a+s+s+h+o+l+e+|b+i+t+c+h+/ig;
    this.socket.emit('chat message', { username: Cookies.get('user'), message:message.replace(badWords,"******") })
  }
}
</script>

```
create a file called `Message.vue` in `frontend/components/chat-component` folder and add this below code :

```vue
<template>
  <div action="" class="box is-info">
    <div class="columns" :style="{ width: '100%', height: '2em' }">
      <div class="column">Chat</div>
      <div
        :style="{
          padding: '.25em',
          justifyContent: 'flex-end',
          overflowWrap: 'normal',
          display: 'flex',
        }"
      >
        <button class="button is-success" @click="logout">Logout</button>
      </div>
    </div>

    <div
      v-for="(item, index) in messages"
      :key="index"
      :style="{
        padding: '.25em',
        justifyContent: 'flex-start',
        overflowWrap: 'normal',
        display: 'flex',
      }"
    >
      <div
        :style="{
          backgroundColor: item.role ? 'blue' : '#48c774',
          color: '#fff',
          padding: '.5em',
          wordWrap: 'break-word',
        }"
        :class="{
          'is-medium': true,
          'is-success': item.role ? false : true,
          'is-info': item.role ? true : false,
        }"
      >
        <label for="" class="label" :style="{ marginBottom: 0 }">{{
          item.username
        }}</label>

        <div>{{ item.message }}</div>
      </div>
    </div>
    <div class="field column is-12-desktop has-addons">
      <div class="control is-expanded">
        <input
          class="input"
          v-model="inputMessage"
          type="text"
          @keyup.enter="sendMessage(inputMessage)"
          placeholder="type message"
        />
      </div>
      <div class="control">
        <a class="button is-info" @click="sendMessage(inputMessage)"> Send</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from 'nuxt-property-decorator'
@Component
export default class Message extends Vue {
  inputMessage: string = ''
  @Prop({ required: true }) readonly messages!: Array<object>
  @Emit()
  sendMessage(message: object): void {
    this.inputMessage = ''
  }
  @Emit()
  logout(): void {}
}
</script>
```

And it's done now go to your `frontend` folder and run `npm run dev` and go to 

    http://localhost:8000

you will find your nuxt app running in the browser go ahead and add your nickname and start chatting, to login to admin just go to `/login_admin` and login using username and password that you create earlier in Step 1.

## Conclusion

In this article you are succesfully building a chat app using nuxtjs and expressjs, if you notice i didn't save the nickname into database this will create a chaos if same person login with the same name you can go ahead and change that by creating table for nickname using Step 1 as reference. If you want to get the full code go ahead and clone this [repo](https://github.com/spiritbro1/nuxtjs-expressjs-chat)
