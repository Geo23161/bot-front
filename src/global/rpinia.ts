import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { Room, Message, ChatProfil, StoreFiles, SocketMessage, User, ReplyMess, ProfilStores, PSUrl, Writer } from "./types"
import { access_tok, get_obj, remove_obj, store_obj, toDate, showLoading, show_alert, is_online, presentToast, generateUniqueFileName } from './rutils';
import { useWebSocket } from "@vueuse/core"
import { Filesystem, Directory } from "@capacitor/filesystem"
import writer_blob from "capacitor-blob-writer"
import { Capacitor } from "@capacitor/core"
import axios from 'axios';
import router from '@/router';
//const socket_url = "wss://celibapps.statusmax.site/chat/?token="
const socket_url = "ws://localhost:8080/chat/?token="

interface AudioComp {
    is_playing: boolean,
    current_a: string,
    total_a: string,
    myVal: string,
    audio: HTMLAudioElement,
    obj: any
}

export const useUserStore = defineStore('user', () => {

    const rooms = ref<Room[]>([])
    const messages = ref<Message[]>([])
    const storeFs = ref<StoreFiles[]>([])
    const all_rooms = computed(() => {
        let rroms = [] as Room[]
        rroms = rroms.concat(rooms.value)
        return rroms
    })

    const initialised = ref(false)
    const user = ref<User>()
    const my_sock = ref()
    let send_ws: (data: string | Blob | ArrayBuffer, useBuffer?: boolean | undefined) => boolean = (data: string | Blob | ArrayBuffer, useBuffer?: boolean | undefined) => false;

    const writers = ref<Writer[]>([])
    
    const state_obj = ref<{
        state: string,
        target: number,
        old_pk: number
    }>({
        state: 'on',
        target: 0,
        old_pk: 0
    })

    const s_url = ref(socket_url)
    setTimeout(async () => {
        s_url.value = socket_url + (await access_tok(useRouter(), undefined))
    }, 50)


    watch(initialised, async (newm, oldm) => {
        if (newm) {
            s_url.value = socket_url + (await access_tok(useRouter(), undefined))
            my_sock.value = useWebSocket(s_url, {
                autoReconnect: {
                    delay: 10000
                },
                onConnected: (ws) => {
                    console.log('Websocket connected: ')
                },
                onDisconnected: async (ws, ev) => {
                    console.error('ws disconnected, retrying...')
                    s_url.value = socket_url + (await access_tok(useRouter(), undefined))
                },
                onMessage: (ws, ev) => {
                    const message: SocketMessage = JSON.parse(ev.data)
                    if (message.type == 'initialisation') {
                        handle_initialisation(message)
                    } else if (message.type == 'new_message') {
                        add_message(message.result as Message)
                        
                        const its_room = all_rooms.value.filter(e => e.id == (message.result as Message).get_room)[0]
                    } else if (message.type == 'messsage_update') {
                        update_message(message.result)
                    } else if (message.type == 'keeping') {
                        for (const utp of message.result) update_message(utp)

                        const rooms_b = message.other['room']
                        for (const rm of rooms_b) {
                                if (!rooms.value.filter(e => e.id == rm.id).length) rooms.value.push(rm)
                            
                        }
                        rooms.value = rooms.value.filter(e => e.users.length > 1)
                        const rroms = [] as Room[]
                        for (const r of rooms.value) {
                            if (!rroms.filter(e => e.id == r.id)[0]) rroms.push(r);
                        }
                        rooms.value = rroms
                    } else if (message.type == 'send_online') {
                        const user = message.result as ChatProfil
                        for (const room of rooms.value) {
                            if (room.users.filter(e => e.id == user.id).length) {
                                room.users = room.users.filter(e => e.id != user.id)
                                room.users.push(user)
                            }
                        }
                    } else if (message.type == 'd_m') {
                        const pk = message.result as number
                        messages.value = messages.value.filter(e => e.id != pk)
                        storeFs.value = storeFs.value.filter(e => e.id != pk)

                    } else if (message.type == 's_o') {
                        const ls = message.result as any[]
                        rooms.value.filter(e => e.users.filter(e => e.id == ls[0]).length)[0].users.filter(e => e.id == ls[0])[0].last = ls[1]
                        
                    } else if (message.type == 's_m') {
                        state_obj.value = message.result
                        messages.value = messages.value.filter(e => !([e.id, e.old_pk].includes(state_obj.value.old_pk)))
                    } else if (message.type == 'g_w') {
                        const writ : Writer = message.result
                        const exist = writers.value.filter(e => e.room == writ.room && e.user == writ.user)[0]
                        if(exist) writers.value.filter(e => e.room == writ.room && e.user == writ.user)[0].last = writ.last;
                        else writers.value.push(writ)
                        console.log('this is writers')
                        console.log(writers.value)
                    }
                }
            })
        }
    })

    const handle_initialisation = (m: SocketMessage) => {
        const result = m.result
        console.log(result)
        user.value = result['user']
        rooms.value = rooms.value.concat(result['rooms'])
        for( const mes of result['messages']) add_message(mes)
        
    }

    const add_message = (message: Message) => {
        messages.value = messages.value.filter(e => e.id != message.id)
        const old_pk = message.old_pk as number
        if (storeFs.value.filter(e => e.id == old_pk)[0]) {
            storeFs.value.filter(e => e.id == old_pk)[0].id = message.id
        }
        messages.value.push(message)
        const m: SocketMessage = {
            type: 'r_m',
            result: message.id
        }
        if (message.user != user.value?.id) {
            send_ws(JSON.stringify(m))
        }

    }
    const update_message = (stpk: (string | number | ReplyMess)[]) => {
        for (const message of messages.value) {
            if (stpk[1] == message.id) {
                message.step = stpk[0] as string
                message.get_reply = stpk[2] as ReplyMess
            }
        }

    }

    const get_room_ = (slug: string) => {
        return all_rooms.value.filter(e => e.slug == slug)[0]
    }

    const get_room_messages = (room: string, lvl: number) => {
        console.log(room)
        console.log(all_rooms.value)
        return messages.value.filter(e => e.get_room == all_rooms.value.filter(e => e.slug == room)[0].id).sort((a, b) => toDate(b.created_at).getTime() - toDate(a.created_at).getTime()).slice(lvl * 30 + (lvl ? 1 : 0), (lvl + 1) * 30).reverse()
    }

    const find_next = (room: string, first: number) => {
        const messags = messages.value.filter(e => e.get_room == get_room_(room).id).sort((a, b) => toDate(b.created_at).getTime() - toDate(a.created_at).getTime())
        let found = false
        const mess: Message[] = []
        for (const m of messags) {
            if (mess.length >= 10) break;
            if (found) {
                mess.push(m)
            }
            if (m.id == first) found = true
        }
        return mess
    }

    const all_mess = computed(() => {
        return messages.value
    })

    const charged_files = ref<string[]>([])

    const audios = ref<{
        id: number,
        player: AudioComp
    }[]>([])

    const add_store = (id: number) => {
        const stF: StoreFiles = {
            id,
            path: '',
            src: '',
            downloaded: false,
            obj: null
        }
        const m = messages.value.filter(e => e.id == id)[0]
        if (m.audio || m.video) {
            stF.obj = {
                typ: m.audio ? 'audio' : 'video',
                path: '',
                src: '',
                size: '00:00'
            }
        }
        storeFs.value.push(stF)
        return stF
    }

    const profil_stores = ref<ProfilStores[]>([])
    watch(profil_stores, async (newps, oldps) => {
        for (const ps of newps) {
            if (ps.path != '') {
                add_ps_url(ps)
            } else {
                if (ps.url) if (ps.url != '') set_path(ps.url)
            }
        }
    }, { deep: true })

    const add_ps_url = (ps: ProfilStores) => {
        if (!ps_url.value.filter(e => e.store.url == ps.url)[0]) {
            ps_url.value.push({
                store: ps,
                src: ''
            })
        }
    }

    const set_path = async (url: string) => {
        const resp = await axios({
            url,
            method: "GET",
            responseType: "blob",
        })
        const blob = resp.data as Blob
        const path = `medias/profils/${generateUniqueFileName()}`
        try {
            const writer = await writer_blob({
                path,
                directory: Directory.Data,
                blob,
                fast_mode: true,
                recursive: true,
            })
            profil_stores.value.filter(e => e.url == url)[0].path = path
        } catch (e) {
            console.log(e)
        }
    }

    const get_or_add = (url: string) => {

        if (!profil_stores.value.filter(e => e.url == url)[0]) profil_stores.value.push({
            url,
            path: ''
        })
        return profil_stores.value.filter(e => e.url == url)[0]
    }

    const ps_url = ref<PSUrl[]>([])
    watch(ps_url, (newss, oldss) => {
        for (const psu of newss) {
            if (psu.src == '') set_src(psu)
        }
    }, { deep: true })

    const set_src = (psu: PSUrl) => {
        if (Capacitor.getPlatform() === "web") {
            Filesystem.readFile({
                path: psu.store.path,
                directory: Directory.Data
            }).then(function ({ data }) {
                const url = URL.createObjectURL(data as Blob);
                ps_url.value.filter(e => e.store.url == psu.store.url)[0].src = url
            });
        } else {

            // It is much easier to get a URL on iOS and Android.

            Filesystem.getUri({
                path: psu.store.path,
                directory: Directory.Data
            }).then(function ({ uri }) {
                ps_url.value.filter(e => e.store.url == psu.store.url)[0].src = Capacitor.convertFileSrc(uri);
            });
        }
    }

    const f_url = (url: string) => {
        const ps = get_or_add(url)
        if (ps.path) {
            const psu = ps_url.value.filter(e => e.store.url == url)[0]
            if (psu) if (psu.src != '') return psu.src
        }

        return '../../imgs/img_no.jpg'
    }


    return {
        audios,
        charged_files,
        all_mess,
        find_next,
        get_room_messages,
        get_room_,
        update_message,
        add_message,
        handle_initialisation,
        user,
        initialised,
        all_rooms,
        storeFs,
        messages,
        rooms,
        my_sock ,
        f_url,
        add_store,
        writers

    }

})
