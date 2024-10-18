<template>
    <ion-page>
        <ion-content>
            <div
                style="display: flex; flex-direction: column; justify-content: center; height: 100%; font-family: 'Poppins'; ">
                <div>
                    <div v-if="image == ''" style="display: flex; justify-content: center; align-items: center;">
                        <div v-if="ttyp_of % 2">
                            <svg viewBox="0 0 200 200" width="100" height="200" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="pl-grad1" x1="1" y1="0.5" x2="0" y2="0.5">
                                        <stop offset="0%" stop-color="hsl(313,90%,55%)" />
                                        <stop offset="100%" stop-color="hsl(223,90%,55%)" />
                                    </linearGradient>
                                    <linearGradient id="pl-grad2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="hsl(313,90%,55%)" />
                                        <stop offset="100%" stop-color="hsl(223,90%,55%)" />
                                    </linearGradient>
                                </defs>
                                <circle class="pl__ring" cx="100" cy="100" r="82" fill="none" stroke="url(#pl-grad1)"
                                    stroke-width="36" stroke-dasharray="0 257 1 257" stroke-dashoffset="0.01"
                                    stroke-linecap="round" transform="rotate(-90,100,100)" />
                                <line class="pl__ball" stroke="url(#pl-grad2)" x1="100" y1="18" x2="100.01" y2="182"
                                    stroke-width="36" stroke-dasharray="1 165" stroke-linecap="round" />
                            </svg>
                        </div>
                        <div v-else>
                            <main>
                                <svg class="ip" viewBox="0 0 256 128" width="256px" height="128px"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stop-color="#5ebd3e" />
                                            <stop offset="33%" stop-color="#ffb900" />
                                            <stop offset="67%" stop-color="#f78200" />
                                            <stop offset="100%" stop-color="#e23838" />
                                        </linearGradient>
                                        <linearGradient id="grad2" x1="1" y1="0" x2="0" y2="0">
                                            <stop offset="0%" stop-color="#e23838" />
                                            <stop offset="33%" stop-color="#973999" />
                                            <stop offset="67%" stop-color="#009cdf" />
                                            <stop offset="100%" stop-color="#5ebd3e" />
                                        </linearGradient>
                                    </defs>
                                    <g fill="none" stroke-linecap="round" stroke-width="16">
                                        <g class="ip__track" stroke="#ddd">
                                            <path d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56" />
                                            <path d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64" />
                                        </g>
                                        <g stroke-dasharray="180 656">
                                            <path class="ip__worm1" stroke="url(#grad1)" stroke-dashoffset="0"
                                                d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56" />
                                            <path class="ip__worm2" stroke="url(#grad2)" stroke-dashoffset="358"
                                                d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64" />
                                        </g>
                                    </g>
                                </svg>
                            </main>
                        </div>
                    </div>
                    <div v-else style="display: flex; justify-content: center; padding: 1.5rem; ">
                        <img :src="image" style="width: 75vw; max-height: 70vh; border-radius: 15px; " />
                    </div>
                    <div v-if="room != ''"
                        style="padding: .5rem; display: flex; justify-content: center; font-size: 1.1rem; font-weight: bold; ">
                        <div>Cliquez sur continuer</div>
                    </div>
                    <div v-if="room != ''" style="padding: 1rem; display: flex; justify-content: center;">
                        <ion-button @click="continue_to()">
                            <ion-icon slot="end" :icon="arrowForward" />
                            Continuer
                        </ion-button>
                    </div>
                </div>

            </div>

        </ion-content>
    </ion-page>
</template>

<style scoped>
* {
    border: 0;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:root {
    --hue: 223;
    --bg: hsl(var(--hue), 10%, 90%);
    --fg: hsl(var(--hue), 10%, 10%);
    font-size: calc(16px + (24 - 16) * (100vw - 320px) / (1280 - 320));
}

body {
    background: var(--bg);
    color: var(--fg);
    font: 1em/1.5 sans-serif;
    height: 100vh;
    display: grid;
    place-items: center;
}

.pl {
    display: block;
    width: 6.25em;
    height: 6.25em;
}

.pl__ring,
.pl__ball {
    animation: ring 2s ease-out infinite;
}

.pl__ball {
    animation-name: ball;
}

/* Dark theme  */
@media (prefers-color-scheme: dark) {
    :root {
        --bg: hsl(var(--hue), 10%, 10%);
        --fg: hsl(var(--hue), 10%, 90%);
    }
}

/* Animation */
@keyframes ring {
    from {
        stroke-dasharray: 0 257 0 0 1 0 0 258;
    }

    25% {
        stroke-dasharray: 0 0 0 0 257 0 258 0;
    }

    50%,
    to {
        stroke-dasharray: 0 0 0 0 0 515 0 0;
    }
}

@keyframes ball {

    from,
    50% {
        animation-timing-function: ease-in;
        stroke-dashoffset: 1;
    }

    64% {
        animation-timing-function: ease-in;
        stroke-dashoffset: -109;
    }

    78% {
        animation-timing-function: ease-in;
        stroke-dashoffset: -145;
    }

    92% {
        animation-timing-function: ease-in;
        stroke-dashoffset: -157;
    }

    57%,
    71%,
    85%,
    99%,
    to {
        animation-timing-function: ease-out;
        stroke-dashoffset: -163;
    }
}


main {
    padding: 1.5em 0;
}

.ip {
    width: 16em;
    height: 8em;
}

.ip__track {
    stroke: hsl(var(--hue), 90%, 90%);
    transition: stroke var(--trans-dur);
}

.ip__worm1,
.ip__worm2 {
    animation: worm1 2s linear infinite;
}

.ip__worm2 {
    animation-name: worm2;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
    :root {
        --bg: hsl(var(--hue), 90%, 5%);
        --fg: hsl(var(--hue), 90%, 95%);
    }

    .ip__track {
        stroke: hsl(var(--hue), 90%, 15%);
    }
}

/* Animation */
@keyframes worm1 {
    from {
        stroke-dashoffset: 0;
    }

    50% {
        animation-timing-function: steps(1);
        stroke-dashoffset: -358;
    }

    50.01% {
        animation-timing-function: linear;
        stroke-dashoffset: 358;
    }

    to {
        stroke-dashoffset: 0;
    }
}

@keyframes worm2 {
    from {
        stroke-dashoffset: 358;
    }

    50% {
        stroke-dashoffset: 0;
    }

    to {
        stroke-dashoffset: -358;
    }
}
</style>

<script setup lang="ts">
import { IonPage, IonContent, onIonViewWillLeave, IonButton, IonIcon, onIonViewDidEnter } from "@ionic/vue"
import { ref, watch } from "vue"
import { arrowForward } from 'ionicons/icons';
import axios from "axios"
import { useRoute, useRouter } from "vue-router";
import { get_obj, store_obj, quick_loading, remove_obj } from '@/global/rutils'
import { useUserStore } from "@/global/rpinia";
import { storeToRefs } from "pinia";

const ttyp_of = ref(0)
const num = ref()

const cid = ref(0)
const image = ref('')

const route = useRoute()
const router = useRouter()
const _userStore = useUserStore()
const userStore = storeToRefs(_userStore)
const { initialised } = userStore
const room = ref('')

watch(room, (newr, oldr) => {
    // setTimeout(() => {
    //     router.push('/room/' + newr + ( is_box.value ? '/?me=yes' : '/'))
    // }, 2500)
})


num.value = setInterval(() => {
    ttyp_of.value++;
}, 2000)

const intiate_all = async () => {
    remove_obj('tokens')
    const resp = await axios.get('api/initiate_all/' + cid.value + '/')
    if (resp.data['done']) {
        store_obj('tokens', JSON.stringify(resp.data['tokens']))
        initialised.value = true
        room.value = resp.data['result']
        image.value = resp.data['other']
    }
}

const is_box = ref(false)
const init_a = async () => {
    const camp_ = route.query['camp'] as string
    if (camp_) {
        const slug = route.query['slug']
        is_box.value = true
        const resp = await axios.get('api/get_tokens/' + camp_ + '/')
        if (resp.data['done']) {
            store_obj('tokens', JSON.stringify(resp.data['result']));
            initialised.value = true
            room.value = slug as string
            image.value = resp.data['other']
        }
        return ;
    }

    cid.value = parseInt(route.params.pk as string)
    intiate_all()
    
}

init_a()

onIonViewWillLeave(() => {
    clearInterval(num.value)
})

const change_title = (title: string) => {
    document.title = title
}

const continue_to = () => {
    if(window.innerWidth > 606) {
        alert("Cette plateforme a été conçu pour mobile. Veuillez y acceder a partir d'un telephone.")
    } else {
        router.push('/room/' + room.value + ( is_box.value ? '/?me=yes' : '/')), quick_loading();
    }
}

</script>
