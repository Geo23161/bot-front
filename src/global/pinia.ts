import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { User, Photo, DaySwipe, ProfilSeen, Profil, Card, Essential, SocketMessage, Room, Message, ChatProfil, Niveau, StoreFiles, ProfilStore, Launcher, ProfilStores, PSUrl, Notif, ReplyMess, GRLimit, UserGroup, Group, QosicObj, Abon } from "./types"
import { access_tok, get_obj, remove_obj, store_obj, toDate, showLoading, show_alert, is_online, presentToast, generateUniqueFileName, set_notifications, estDansLaPlagePermise, getCurrentWeekString } from './utils';
import { useWebSocket } from "@vueuse/core"
import { Filesystem, Directory } from "@capacitor/filesystem"
import writer_blob from "capacitor-blob-writer"
import { Capacitor } from "@capacitor/core"
import axios from 'axios';
import router from '@/router';
const socket_url = "wss://celibapps.statusmax.site/chat/?token="
//const socket_url = "ws://localhost:8080/chat/?token="

interface AudioComp {
    is_playing: boolean,
    current_a: string,
    total_a: string,
    myVal: string,
    audio: HTMLAudioElement,
    obj: any
}

export const useUserStore = defineStore('user', () => {

    const day_mess = ref<{
        [key: string]: number[]
    }>({})

    const mess_recap = ref<{
        [key: string]: {
            sroom: string[],
            groom: string[]
        }
    }>({})
    watch(mess_recap, (newr, oldr) => {
        store_obj('mess_recap', JSON.stringify(newr))
    })

    const can_share = computed(() => {
        return Object.keys(all_swipe.value).length > 1
    })
    watch(day_mess, (newd, oldd) => {
        store_obj('day_mess', JSON.stringify(newd))
    })
    const day_discuss = ref()
    const spl_invents = ref()
    const gr_limits = ref<GRLimit>()
    const asset_url = ref('https://res.cloudinary.com/dsmjumzll/image/upload/v1')
    const has_sen = ref(1)
    const charged_files = ref<string[]>([])
    const rooms = ref<Room[]>([])
    const groups = ref<Group[]>([])
    const has_post = ref(false)
    const qosic = ref<QosicObj>({
        transref: "",
        number: '',
        typ: '',
        amount: '',
        abn: '',
        code: 10000
    })
    
    const actual_page = ref('')
    watch(qosic, async (newq, oldq) => {
        if (newq) await store_obj('qosic', JSON.stringify(newq))

        if (newq.transref != '') {
            if (newq.code == 10000 && !oldq) {
                try {
                    const resp = await check_qosic(newq)
                    if (!resp.data['done']) qosic.value = {
                        transref: "",
                        number: '',
                        typ: '',
                        amount: '',
                        abn: '',
                        code: 10000
                    }
                } catch (e) {
                    console.log(e)
                }
            }
            if (newq.code == -10000) {
                g_load.value = await showLoading('Confirmer le paiement...')
                setTimeout(() => {
                    g_load.value?.dismiss()
                }, 180000)
                try {
                    const resp = await check_qosic(newq)
                } catch (e) {
                    await show_alert('','Une erreur est survenue. Vérifiez votre connexion internet et reéssayer.')
                    g_load.value?.dismiss()
                    console.log(e)
                }
            } else if (newq.code == 1) {
                if(!g_load.value) g_load.value = await showLoading('Confirmer le paiement...'), setTimeout(() => {
                    g_load.value?.dismiss()
                }, 180000)
                try {
                    const resp = await check_qosic(newq)
                } catch (e) {
                    await show_alert('Validation de paiement','Une erreur est survenue. Vérifiez votre connexion internet et redémarrer l\'application.')
                    g_load.value?.dismiss()
                    console.log(e)
                }
            } else if (newq.code == -1) {
                if(g_load.value) g_load.value.dismiss()
                await show_alert('Echec du paiement', "Le paiement n'a pas été approuvé ou ne peut être éffectué.")
                qosic.value = {
                    transref: "",
                    number: '',
                    typ: '',
                    amount: '',
                    abn: '',
                    code: 10000
                }
            } else if (newq.code === 0) {
                if(g_load.value) g_load.value.dismiss()
                await presentToast('top', 'Ticket mis à jour avec succès', "success", 5000)
                if(actual_page.value == 'payment') router.back()
            }
        }

    }, {
        deep : true
    })

    const check_qosic = async (qos: QosicObj) => {
        const resp = await axios.post('api/waiting_payment/', {
            transref: qos.transref
        }, {
            headers: {
                Authorization: `Bearer ${await access_tok(router, undefined)}`
            }
        })
        return resp
    }

    const actual_prev = ref<{
        id: number,
        target: number,
        text: string,
        status: string,
        actual_swipe: number
    }>()

    const del_users = ref<{
        user: ChatProfil,
        slug: string,
        prenom: string
    }[]>([])
    watch(del_users, (newd, old) => {
        if (newd) store_obj('del_users', JSON.stringify(newd))
    })

    const offnonym = ref<{ room: string, val: number[] }[]>([])
    watch(offnonym, (newo, oldo) => {
        if (oldo) store_obj('offnonym', JSON.stringify(newo))
    })
    setTimeout(async () => {
        const offnonym_ = await get_obj('offnonym')
        if (offnonym_) offnonym.value = JSON.parse(offnonym_)
    }, 2500)

    watch(rooms, (newr, oldr) => {
        if (newr) store_obj('rooms', JSON.stringify(newr))
    }, { deep: true })
    watch(groups, (newr, oldr) => {
        if (newr) store_obj('groups', JSON.stringify(newr))
    }, { deep: true })
    const seen_rooms = ref<number[]>([])
    watch(seen_rooms, (news, olds) => {
        store_obj('seen_rooms', JSON.stringify(news))
    }, { deep: true })
    const messages = ref<Message[]>([])
    watch(messages, (newm, oldm) => {
        if (newm) store_obj('messages', JSON.stringify(newm))
    }, { deep: true })
    const storeFs = ref<StoreFiles[]>([])
    watch(storeFs, (news, olds) => {
        if (news) store_obj('storeFs', JSON.stringify(news))
    }, { deep: true })
    const has_new_room = ref(false)
    const initialised = ref(false)
    const s_url = ref(socket_url)
    const has_new_groom = ref(false)
    setTimeout(async () => {
        s_url.value = socket_url + (await access_tok(useRouter(), undefined))
    }, 50)



    const { send, status } = useWebSocket(s_url, {
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
                if (!initialised.value) handle_initialisation(message)
                const deleteds = message.other as number[]
                messages.value = messages.value.filter(e => !deleteds.includes(e.id))
            } else if (message.type == 'new_room') {
                if (!rooms.value.filter(e => e.id == (message.result as Room).id).length) {
                    const nroom = message.result as Room
                    if (!nroom.get_groups) rooms.value.push(message.result as Room), launchers.value.push({ slug: (message.result as Room).slug, launcher: null })
                    else if (nroom.get_groups) {
                        if (!groups.value.filter(e => nroom.get_groups?.includes(e.id))[0].rooms.filter(e => e.id == nroom.id)[0]) groups.value.filter(e => nroom.get_groups?.includes(e.id))[0].rooms.push(nroom)
                        has_new_groom.value = true
                    }
                }
                send(JSON.stringify({
                    type: 'register_me',
                    result: (message.result as Room).slug
                }))
                has_new_room.value = true
                if (g_load.value) {
                    setTimeout(() => {
                        g_load.value.dismiss()
                        g_load.value = undefined
                        router.push(`/${(message.result as Room).slug[0] == 'g' ? 'g' : ''}room/${(message.result as Room).slug}`)
                    }, 200)
                }
            } else if (message.type == 'new_group') {
                const ngroup = message.result as Group
                if (!groups.value.filter(e => e.id == ngroup.id)[0]) groups.value.push(ngroup)
                has_new_groom.value = true
                if (g_load.value) {
                    setTimeout(() => {
                        g_load.value.dismiss()
                        g_load.value = undefined
                        router.replace(`/group/${ngroup.id}`)
                    }, 200)
                }
            } else if (message.type == 'new_message') {
                add_message(message.result as Message)
                for (const pk of message.other) if (!only_verified.value.includes(pk)) only_verified.value.push(pk)
                if (!day_mess.value[day_string.value]) {
                    day_mess.value[day_string.value] = []
                }
                if (!day_mess.value[day_string.value].includes((message.result as Message).get_room)) day_mess.value[day_string.value].push((message.result as Message).get_room)
                const its_room = all_rooms.value.filter(e => e.id == (message.result as Message).get_room)[0]

                if (!mess_recap.value[day_string.value][its_room.get_groups ? 'groom' : 'sroom'].filter(e => e == its_room.slug)[0]) mess_recap.value[day_string.value][its_room.get_groups ? 'groom' : 'sroom'].push(its_room.slug)
            } else if (message.type == 'messsage_update') {
                update_message(message.result)
            } else if (message.type == 'keeping') {
                for (const utp of message.result) update_message(utp)

                const rooms_b = message.other['room']
                const grps_b = message.other['group']
                for (const rm of rooms_b) {
                    if (!rm.get_groups) {
                        if (!rooms.value.filter(e => e.id == rm.id).length) rooms.value.push(rm)
                    }
                    else {
                        for (const gr of groups.value) {
                            if (rm.get_groups.includes(gr.id)) if (!gr.rooms.filter(e => e.id == rm.id).length)
                                gr.rooms.push(rm)
                        }
                    }
                }
                rooms.value = rooms.value.filter(e => e.users.length > 1)
                const rroms = [] as Room[]
                for (const r of rooms.value) {
                    if (!rroms.filter(e => e.id == r.id)[0]) rroms.push(r);
                }
                rooms.value = rroms

                for (const grp of grps_b) {
                    if (!groups.value.filter(e => e.id == grp.id).length) groups.value.push(grp)
                }

                for (const grp of groups.value) {
                    const rroms = [] as Room[]
                    for (const r of grp.rooms) {
                        if (!rroms.filter(e => e.slug == r.slug)[0]) rroms.push(r);
                    }
                    grp.rooms = rroms
                }
            } else if (message.type == 'send_online') {
                const user = message.result as ChatProfil
                for (const room of rooms.value) {
                    if (room.users.filter(e => e.id == user.id).length) {
                        room.users = room.users.filter(e => e.id != user.id)
                        room.users.push(user)
                    }
                }
                for (const gr of groups.value) {
                    for (const room of gr.rooms) {
                        if (room.users.filter(e => e.id == user.id).length) {
                            room.users = room.users.filter(e => e.id != user.id)
                            room.users.push(user)
                        }
                    }
                }
            } else if (message.type == 'd_m') {
                const pk = message.result as number
                messages.value = messages.value.filter(e => e.id != pk)
                storeFs.value = storeFs.value.filter(e => e.id != pk)

            } else if (message.type == 's_o') {
                const ls = message.result as any[]
                rooms.value.filter(e => e.users.filter(e => e.id == ls[0]).length)[0].users.filter(e => e.id == ls[0])[0].last = ls[1]
                for (const gr of groups.value) {
                    if (gr.users.filter(e => e.id == ls[0]).length) gr.users.filter(e => e.id == ls[0])[0].last = ls[1]
                    if (gr.rooms.filter(e => e.users.filter(e => e.id == ls[0]).length)[0]) gr.rooms.filter(e => e.users.filter(e => e.id == ls[0]).length)[0].users.filter(e => e.id == ls[0])[0].last = ls[1]
                }
            } else if (message.type == 'launcher_send') {
                const laun = message.result as Launcher
                const room = rooms.value.filter(e => e.id == laun.id)[0]
                if (room) {
                    launchers.value.filter(e => e.slug == room.slug)[0].launcher = laun
                }
            } else if (message.type == 'refuse_la') {
                refuse_la(message.result)
            } else if (message.type == 'new_niveau') {
                const niv: Niveau = message.result
                get_room_(message.other as string).niveau = niv
                launchers.value.filter(e => e.slug == message.other)[0].launcher = null
                l_accepted.value = false
            } else if (message.type == 'refused') {
                l_refused.value = false
            } else if (message.type == 's_m') {
                state_obj.value = message.result
                messages.value = messages.value.filter(e => !([e.id, e.old_pk].includes(state_obj.value.old_pk)))
            } else if (message.type == 'new_notif') {
                const notif = message.result as Notif
                const dt = new Date()
                const new_notifs = notifs.value.filter(e => ((dt.getTime() - toDate(e.created_at).getTime()) / 1000) < 31 * 24 * 60 * 60)
                if (!notifs.value.filter(e => e.id == notif.id)[0]) new_notifs.push(notif)
                notifs.value = new_notifs
            } else if (message.type == 'offnonym') {
                const result = message.result
                offnonym.value = [result].concat(offnonym.value.filter(e => e.room != result.room))
            } else if (message.type == 'anonym_on') {
                const room = rooms.value.filter(e => e.slug == message.result)[0]
                if (room) {
                    room.is_proposed = false
                    room.get_anonymous = undefined
                    offnonym.value = offnonym.value.filter(e => e.room != room.slug)
                    router.replace('/room/' + room.slug)
                    show_alert('Mode anonyme désactivé', "Vous pouvez maintenant voir le profil de " + room.users.filter(e => e.id != user.value?.id)[0].prenom + " car le mode anonyme a été désactivé.")
                }
            } else if (message.type == 'new_post') {
                has_post.value = true
            }
            else if (message.type == 'update_gusers') {
                const ngrp = message.result as Group
                groups.value = groups.value.filter(e => e.id != ngrp.id)
                groups.value.push(ngrp)
            } else if (message.type == 'rmvu_from_r') {
                const res: {
                    user: number,
                    slug: string,
                    prenom: string
                } = message.result
                if (res.slug[0] == 'g') {
                    const the_user = groups.value.filter(e => e.rooms.filter(e => e.slug == res.slug)[0])[0].rooms.filter(e => e.slug == res.slug)[0].users.filter(e => e.id == res.user)[0]

                    groups.value.filter(e => e.rooms.filter(e => e.slug == res.slug)[0])[0].rooms.filter(e => e.slug == res.slug)[0].users = groups.value.filter(e => e.rooms.filter(e => e.slug == res.slug)[0])[0].rooms.filter(e => e.slug == res.slug)[0].users.filter(e => e.id != res.user)
                    recent_del.value = res
                    if (the_user) {
                        del_users.value.push({
                            user: the_user,
                            slug: res.slug,
                            prenom: res.prenom
                        })
                    }
                }
            } else if (message.type == 'rmvu_from_g') {
                const res: {
                    user: number,
                    slug: number,
                    prenom: string
                } = message.result
                groups.value.filter(e => e.id == res.slug)[0].users = groups.value.filter(e => e.id == res.slug)[0].users.filter(e => e.id != res.user)

                recent_del.value = res
            } else if (message.type == 'momo_pay') {
                const res = message.result as { transref : string, status : string}

                if (qosic.value.transref == res.transref) {
                    qosic.value.code = res.status == 'error' ? -1 : 0
                    if(user.value) user.value.cur_abn = message.other as Abon
                }
                
            }
        },
    })

    const recent_del = ref<{
        user: number,
        slug: string | number,
        prenom: string
    }>()
    watch(recent_del, (newr, oldr) => {
        if (newr) store_obj('recent_del', JSON.stringify(newr))
    })

    const refuse_la = (result: any) => {
        const laun = result as Launcher
        const room = rooms.value.filter(e => e.id == laun.id)[0]
        const you = room.users.filter(e => e.id != user.value?.id)[0]
        if (launchers.value.filter(e => e.slug == room.slug)[0].launcher) show_alert('Demande rejeté.', `${you.prenom} a rejeté votre demande de passage à l'etape suivante.`)
        launchers.value.filter(e => e.slug == room.slug)[0].launcher = null
        l_refused.value = false
    }

    const send_times = ref(0)

    const send_essentials = () => {
        const rescues = messages.value.filter(e => e.id != user.value?.id).filter(e => e.step != 'seen')
        const pks = []
        const nivs = [] as { room: number, niv: string }[]
        const mlikes = [] as number[]
        const mglikes = [] as number[]
        const mmatches = [] as number[]
        const mgmatches = [] as any[]
        const not_mmatches = [] as any[]
        const oth_mmatches = [] as any[]
        for (const l of likes.value) mlikes.push(l)
        for (const m of matches.value) mmatches.push(m)
        for (const m of gmatches.value) mgmatches.push(m)
        for (const m of oth_matches.value) oth_mmatches.push(m)
        for (const m of not_matches.value) not_mmatches.push(m)
        for (const gl of glikes.value) mglikes.push(gl)
        for (const res of rescues) pks.push(res.id)
        for (const r of rooms.value) nivs.push({ room: r.id, niv: `${r.niveau.level}:${r.niveau.get_task.id}` })
        const content = {
            'type': 'heartbeat',
            'essentials': new_essentials.value,
            'likes': mlikes,
            'matches': mmatches,
            'gmatches': mgmatches,
            'rescues': pks,
            'nivs': nivs,
            'time': send_times.value,
            'oth_matches': oth_mmatches,
            'not_matches': not_mmatches,
            'glikes': mglikes,
            'g_users': g_users.value
        }
        send_times.value = 1
        remove_obj('seen_tofs')
        remove_obj('already_seens')
        remove_obj('all_swipe')
        send(JSON.stringify(content))

        setTimeout(() => {
            matches.value = []
            gmatches.value = []
            likes.value = []
            glikes.value = []
            oth_matches.value = []
            not_matches.value = []
        }, 100)

    }
    setInterval(() => {
        send_essentials()
        if (user.value && !notif_registred.value) {
            set_notifications()
            setTimeout(() => {
                notif_registred.value = true
            }, 200)
        }
    }, 60000)

    const g_users = computed(() => {
        const l_users = [] as any[]
        for (const gr of groups.value) {
            l_users.push({
                'id': gr.id,
                'users': gr.users.length
            })
        }
        return l_users
    })

    const handle_initialisation = async (message: SocketMessage) => {
        const res = message['result']
        const room_pks = [] as number[]
        for (const room of (res['rooms'] as Room[])) {
            if (!room.get_groups) if (rooms.value.filter(e => e.id == room.id).length == 0) rooms.value.push(room), has_new_room.value = true
            else if (room.get_groups) {
                groups.value.filter(e => room.get_groups?.includes(e.id))[0].rooms.push(room)
                has_new_groom.value = true
            }
            room_pks.push(room.id)
        }
        const grp_pks = [] as number[]
        for (const grp of groups.value) {
            grp_pks.push(grp.id)
        }
        const pks = [] as number[]
        for (const message of (res['messages'] as Message[])) {
            if (message.step != 'seen') pks.push(message.id)
            add_message(message)
        }

        const ess = res['essentials']
        set_essential(ess)
        if (user.value?.cur_abn) {
            if (user.value && res['verif']) {
                user.value.cur_abn.verif = res['verif']
            } else if (!res['verif'] && user.value) {
                user.value.cur_abn.verif = undefined
            }
        }
        if (res['asset_url']) {

            asset_url.value = res['asset_url']
        }
        day_discuss.value = res['day_discuss']
        console.log('day_discuss');
        console.log(day_discuss.value);
        spl_invents.value = res['spl_invents']
        gr_limits.value = res['gr_limits']

        const content: SocketMessage = {
            type: 'keeping',
            result: pks,
            other: {
                'room': room_pks,
                'group': grp_pks
            }
        }
        const ntfs = res['notifs'] as Notif[]
        for (const ntf of ntfs) {
            if (!notifs.value.filter(e => e.id == ntf.id)[0]) notifs.value.push(ntf)
        }

        send(JSON.stringify(content))
        initialised.value = true
        send_essentials()

        if (res['bad_profil']) {
            setTimeout(() => {
                router.push('/bad')
            }, 2000)
        }
        else if (res["should_invite"]) {
            const has_inv = await get_obj('has_invited')
            setTimeout(() => {
                if (!has_inv && can_share.value) {
                    router.push('/invite')
                }
            }, 500)
        }
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
            send(JSON.stringify(m))
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

    const has_new = computed(() => {
        return (messages.value.filter(e => (e.user != user.value?.id && e.step != 'seen')).length > 0) || has_new_groom.value || has_new_room.value
    })


    const day_string = computed(() => {
        const dt = new Date()
        return `${dt.getFullYear()}:${dt.getMonth() + 1}:${dt.getDate()}`
    })
    const sem_string = computed(() => {
        return getCurrentWeekString()
    })
    const notif_registred = ref(false)
    const user = ref<User>()
    watch(user, (newu, oldu) => {
        store_obj('user', JSON.stringify(newu))

    }, { deep: true })
    const has_checked = ref(false)
    const seen_tofs = ref<number[]>([])
    const already_seens = ref<ProfilSeen[]>([])
    watch(already_seens, (newa, olda) => {
        store_obj('already_seens', JSON.stringify(newa))
    }, { deep: true })
    watch(seen_tofs, (news, olds) => {
        store_obj('seen_tofs', JSON.stringify(news))
    }, { deep: true })

    const excepts = computed(() => {
        const liste = [] as number[]
        already_seens.value.forEach(element => {
            const since = new Date(element.since)
            const dt = new Date()
            if ((dt.getTime() - since.getTime()) < (4 * 24 * 60 * 60)) liste.push(element.id)
        });
        return liste
    })
    const likes = ref<number[]>([])
    watch(likes, (newl, oldl) => {
        store_obj('likes', JSON.stringify(newl))
    }, { deep: true })
    const glikes = ref<number[]>([])
    watch(glikes, (newl, oldl) => {
        store_obj('glikes', JSON.stringify(newl))
    }, { deep: true })
    const dislikes = ref<number[]>([])
    const all_swipe = ref<DaySwipe>({})
    const all_slikes = ref<DaySwipe>({})
    const gr_swipe = ref<DaySwipe>({})
    const matches = ref<number[]>([])
    const gmatches = ref<{
        author: number,
        target: number
    }[]>([])
    const oth_matches = ref<{
        user: number,
        typ: string,
        obj: string
    }[]>([])
    const not_matches = ref<{
        user: number,
        typ: string,
        obj: string
    }[]>([])
    watch(matches, (newm, oldm) => {
        store_obj('matches', JSON.stringify(newm))
    }, { deep: true })
    watch(all_swipe, (newu, oldu) => {
        store_obj('all_swipe', JSON.stringify(newu))
    }, { deep: true })
    watch(all_slikes, (newu, oldu) => {
        store_obj('all_slikes', JSON.stringify(newu))
    }, { deep: true })
    watch(gr_swipe, (newu, oldu) => {
        store_obj('gr_swipe', JSON.stringify(newu))
    }, { deep: true })
    const day_limit = computed(() => {
        if (!user.value) return 0
        if (!user.value.cur_abn) return 0
        return user.value.cur_abn.get_typ.limit
    })

    const can_swipe = computed(() => {
        if ((!user.value?.cur_abn) || !user.value.cur_abn.is_on) {
            if (!all_swipe.value[day_string.value]) all_swipe.value[day_string.value] = 0;
            return all_swipe.value[day_string.value] < 10
        }
        return all_swipe.value[day_string.value] ? (all_swipe.value[day_string.value] < day_limit.value) : true
    })

    const total_swipe = computed(() => {
        let swp = 0;
        for (const dsw in all_swipe.value) swp += all_swipe.value[dsw]

        return swp;
    })

    const update_user = async () => {
        const stored_user = await get_obj('user')
        if (stored_user) user.value = JSON.parse(stored_user)
    }

    const new_essentials = ref<Essential>({
        all_swipe: {},
        seen_tofs: [],
        already_seens: [],
        all_slikes: {},
        gr_swipe: {}
    })
    const store_card = (card: Card) => {

        const as = {
            id: card.pk,
            since: (new Date()).toUTCString()
        }
        already_seens.value.push(as)
        new_essentials.value?.already_seens.push(as)

        seen_tofs.value.push(urlToPk.value[`card:${card.pk}`])
        new_essentials.value?.seen_tofs.push(urlToPk.value[`card:${card.pk}`])

        if (!all_swipe.value[day_string.value]) all_swipe.value[day_string.value] = 1
        else all_swipe.value[day_string.value]++;
        (new_essentials.value as Essential).all_swipe[day_string.value] = all_swipe.value[day_string.value]

    }

    const store_group = (gr: UserGroup) => {
        if (!gr_swipe.value[day_string.value]) gr_swipe.value[day_string.value] = 1;
        else gr_swipe.value[day_string.value]++;
        (new_essentials.value as Essential).gr_swipe[day_string.value] = gr_swipe.value[day_string.value]
        console.log(new_essentials.value)
    }

    const swipe_right = (card: Card) => {
        likes.value.push(card.pk)
        store_card(card)
    }

    const swipe_rightgr = (card: UserGroup) => {
        glikes.value.push(card.id)
        store_group(card)
    }
    const swipe_left = (card: Card) => {
        dislikes.value.push(card.pk)
        store_card(card)
    }

    const swipe_leftgr = (gr: UserGroup) => {
        store_group(gr)
    }

    const why_cant_swipe = (card: Card) => {
        if (!user.value?.cur_abn) return 'abon'
        if (!user.value.cur_abn.is_on) return 'expired'
        else return 'limit'
    }

    const urlToPk = ref<{
        [key: string]: number
    }>({})

    const build_card = (profil: Profil) => {
        let rimg = "", color = "", pk = 0
        if (!seen_tofs.value.includes(profil.get_profil.id)) rimg = profil.get_profil.get_picture, color = profil.get_profil.color, pk = profil.get_profil.id
        else {
            profil.photos.forEach(element => {
                if (!seen_tofs.value.includes(element.id)) rimg = element.get_picture, color = element.color, pk = element.id
            });
        }
        if (rimg == '') rimg = profil.get_profil.get_picture, color = profil.get_profil.color, pk = profil.get_profil.id
        const card: Card = {
            url: rimg.includes('https://') ? rimg : asset_url.value + rimg,
            name: profil.prenom,
            color,
            sign: profil.get_sign,
            pk: profil.id,
            status: profil.get_status,
            photos: profil.photos.length,
            get_age: profil.get_age as string,
            i_like: profil.i_like,
            commons: profil.commons,
            reaction: profil.reaction
        }
        urlToPk.value[`card:${card.pk}`] = pk
        return card
    }

    const plikes = computed(() => {
        if (!user.value) return []
        return user.value.get_likes
    })



    const set_essential = async (ess: Essential) => {
        let swipes = await get_obj('all_swipe')
        seen_tofs.value = ess.seen_tofs
        already_seens.value = ess.already_seens
        all_swipe.value = ess.all_swipe
        all_slikes.value = ess.all_slikes ? ess.all_slikes : {}
        gr_swipe.value = ess.gr_swipe ? ess.gr_swipe : {}

        let seens = await get_obj('already_seens')
        if (seens) {
            seens = JSON.parse(seens)
            for (const seen of seens) {
                new_essentials.value?.already_seens.push(seen)
            }
        }

        if (swipes) {
            swipes = JSON.parse(swipes)
            for (const swpe in swipes) {
                if (!all_swipe.value[swpe]) {
                    all_swipe.value[swpe] = swipes[swpe]
                } else if (all_swipe.value[swpe] < swipes[swpe]) {
                    all_swipe.value[swpe] = swipes[swpe]
                }
            }
        }

        let grs = await get_obj('gr_swipe')
        if (grs) {
            grs = JSON.parse(grs)
            for (const gr in grs) {
                if (!gr_swipe.value[gr]) gr_swipe.value[gr] = grs[gr]
                else if (gr_swipe.value[gr] < gr_swipe.value[gr]) {
                    gr_swipe.value[gr] = grs[gr]
                }
            }
        }

        let sls = await get_obj('all_slikes')
        if (sls) {
            sls = JSON.parse(sls)
            for (const sl in sls) {
                if (!all_slikes.value[sl]) {
                    all_slikes.value[sl] = sls[sl]
                } else if (all_slikes.value[sl] < sls[sl]) {
                    all_slikes.value[sl] = sls[sl]
                }
            }
        }
        new_essentials.value.all_swipe = all_swipe.value;
        new_essentials.value.all_slikes = all_slikes.value
        new_essentials.value.gr_swipe = gr_swipe.value
    }
    const set_all = async () => {
        update_user()
        const profil_stores_ = await get_obj('profil_stores')
        if (profil_stores_) profil_stores.value = JSON.parse(profil_stores_)
        const rooms_ = await get_obj('rooms')
        if (rooms_) rooms.value = JSON.parse(rooms_)

        const qosic_ = await get_obj('qosic')
        if (qosic_) qosic.value = JSON.parse(qosic_)

        const del_users_ = await get_obj('groups')
        if (del_users_) del_users.value = JSON.parse(del_users_)

        const groups_ = await get_obj('groups')
        if (groups_) groups.value = JSON.parse(groups_)

        const recent_del_ = await get_obj('recent_del')
        if (recent_del_) recent_del.value = JSON.parse(recent_del_)

        const messages_ = await get_obj('messages')
        if (messages_) messages.value = JSON.parse(messages_)

        const stores_ = await get_obj('storeFs')
        if (stores_) storeFs.value = JSON.parse(stores_)

        for (const r of rooms.value) launchers.value.push({ slug: r.slug, launcher: null })

        const has_sen_ = await get_obj('has_sen')
        if (has_sen_ == 0 || has_sen_ == 1) has_sen.value = has_sen_

        const payment_ = await get_obj('payment')
        if (payment_) if (!(payment_ as string).includes('null')) payment.value = JSON.parse(payment_)

        const seen_rooms_ = await get_obj('seen_rooms')
        if (seen_rooms_) seen_rooms.value = JSON.parse(seen_rooms_)

        const notif_registred_ = await get_obj('notif_registred')
        if (notif_registred_) notif_registred.value = true

        const notifs_ = await get_obj('notifs')
        if (notifs_) notifs.value = JSON.parse(notifs_)

        const seen_notifs_ = await get_obj('seen_notifs')
        if (seen_notifs_) seen_notifs.value = JSON.parse(seen_notifs_)

        const day_mess_ = await get_obj('day_mess')
        if (day_mess_) day_mess.value = JSON.parse(day_mess_)

        const matches_ = await get_obj('matches')
        if (matches_) matches.value = JSON.parse(matches_)

        const gmatches_ = await get_obj('gmatches')
        if (gmatches_) gmatches.value = JSON.parse(gmatches_)

        const likes_ = await get_obj('likes')
        if (likes_) likes.value = JSON.parse(likes_)
    }
    set_all()

    const check_first_come = async () => {

        const come_first_ = await get_obj('come_first')
        if (!come_first_ && !is_blocked.value) come_first.value = true
    }

    const here_first = computed(() => {
        return come_first.value
    })

    const last_message = (room: Room, is_group = false) => {
        const mess = messages.value.filter(e => e.get_room == room.id).sort((a, b) => (toDate(b.created_at).getTime() - toDate(a.created_at).getTime()))[0]
        if (mess) return mess
        else {
            const no_mess: Message = {
                id: 0,
                get_room: room.id,
                created_at: room.created_at,
                step: 'seen',
                text: !is_group ? (!room.is_proposed ? room.why : "Soyez le premier à demarrer la conversation") : "Soyez le premier à ecrire dans ce groupe",
                image: null,
                audio: null,
                video: null,
                user: 0
            }
            return no_mess
        }
    }

    const last_messagegr = (grp: Group) => {
        const gr_rooms = [] as number[]
        for (const r of grp.rooms) gr_rooms.push(r.id)
        const mess = messages.value.filter(e => gr_rooms.includes(e.id)).sort((a, b) => toDate(b.created_at).getTime() - toDate(a.created_at).getTime())[0]
        if (mess) return mess.created_at
        else {
            const rs = grp.rooms.sort((a, b) => toDate(b.created_at).getTime() - toDate(a.created_at).getTime())[0]
            return rs.created_at
        }
    }

    const proposed_rooms = computed(() => {
        return rooms.value.filter(e => e.is_proposed).sort((a, b) => (toDate(last_message(b).created_at).getTime() - toDate(last_message(a).created_at).getTime()))
    })

    const gained_rooms = computed(() => {
        return rooms.value.filter(e => !e.is_proposed).sort((a, b) => (toDate(last_message(b).created_at).getTime() - toDate(last_message(a).created_at).getTime()))
    })

    const user_matches = computed(() => {
        const users = [] as ChatProfil[]
        for (const room of rooms.value) {
            const _you = room.users.filter(e => e.id != user.value?.id)[0]
            if (users.filter(e => e.id == _you.id).length == 0) users.push(_you)
        }
        return users
    })

    const get_room_from_message = (roomId: number) => {
        return rooms.value.filter(e => e.id == roomId)[0]
    }

    const not_seens = (room: Room) => {
        return messages.value.filter(e => e.get_room == room.id).filter(e => e.step != 'seen').filter(e => e.user != user.value?.id)
    }

    const get_room_ = (slug: string) => {
        return all_rooms.value.filter(e => e.slug == slug)[0]
    }

    const get_room_gr = (id: number) => {
        return groups.value.filter(e => e.rooms.filter(e => e.id == id)[0])[0].rooms.filter(e => e.id == id)[0]
    }

    const get_room_messages = (room: string, lvl: number) => {
        return messages.value.filter(e => e.get_room == all_rooms.value.filter(e => e.slug == room)[0].id).sort((a, b) => toDate(b.created_at).getTime() - toDate(a.created_at).getTime()).slice(lvl * 30 + (lvl ? 1 : 0), (lvl + 1) * 30).reverse()

    }

    const can_anonym = ref<boolean>(true)

    const quit_group = async (id: number) => {
        const load = await showLoading('Patientez...')
        try {
            const resp = await axios.post('api/quit_group/', {
                pk: id
            }, {
                headers: {
                    Authorization: `Bearer ${await access_tok(router, undefined)}`
                }
            })
            const slugs = resp.data['result']
            for (const slug of slugs) {
                send(JSON.stringify({
                    type: 'rmv_me',
                    result: slug
                }))
            }
            groups.value = groups.value.filter(e => e.id != id)
            router.back()
        } catch (e) {
            show_alert('Erreur de survenue', "Une erreur est survenue lors de la suppression ")
        }
        load.dismiss()
    }

    const delete_room = async (id: number, is_group = false) => {
        const load = await showLoading('Loading...')
        try {
            const resp = await axios.get('api/delete_room/' + id + (is_group ? '/?is_group=1' : ''), {
                headers: {
                    Authorization: `Bearer ${await access_tok(router, load)}`
                }
            })
            if (resp.data['done']) {
                const old_room = rooms.value.filter(e => e.id == id)[0]
                if (old_room.get_groups) {
                    const grp = groups.value.filter(e => old_room.get_groups?.includes(e.id))[0]
                    grp.rooms = grp.rooms.filter(e => e.id != old_room.id)

                }
                const slug = rooms.value.filter(e => e.id == id)[0].slug
                rooms.value = rooms.value.filter(e => e.id != id)

                seen_rooms.value = seen_rooms.value.filter(e => e != id)
                messages.value = messages.value.filter(e => e.get_room != id)
                send(JSON.stringify({
                    type: 'rmv_me',
                    result: slug
                }))
                router.back()
            }
        } catch (e) {
            show_alert('Erreur de survenue', "Une erreur est survenue lors de la suppression ")
        }
        load.dismiss()
    }


    const next_niveau = async (id: number) => {
        const load = await showLoading('Loading...')
        try {
            const resp = await axios.get('api/next_niveau/' + id, {
                headers: {
                    Authorization: `Bearer ${await access_tok(router, load)}`
                }
            })
            if (resp.data['done']) {
                rooms.value.filter(e => e.id == id)[0].niveau = resp.data['done'] as Niveau
            }

        } catch (e) {
            show_alert('Erreur de survenue', "Une erreur est survenue lors de la suppression *4")
        }
        load.dismiss()
    }

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

    /* const pstores  = ref<ProfilStore[]>([])
    watch(pstores, (newp, oldp) => {
        store_obj('pstores', JSON.stringify(newp))
    })

    const get_profil = (user : ChatProfil) => {

    } */

    const is_match = (id: number) => {
        const users = []
        for (const r of rooms.value) {
            const us = r.users.filter(e => e.id != user.value?.id)[0].id
            users.push(us)
        }
        return users.includes(id)
    }

    const remove_message = (id: number) => {
        messages.value = messages.value.filter(e => e.id != id)
    }

    const delete_message = async (id: number, typ: 'me' | 'all') => {
        if (typ == 'me') remove_message(id)
        else {
            const load = await showLoading('Suppression...')
            try {
                const resp = await axios.get('api/delete_message/' + id + '/', {
                    headers: {
                        Authorization: `Bearer ${await access_tok(router, load)}`
                    }
                })
            } catch (e) {

                show_alert('', 'Une erreur est survenue lors de la suppression, veuillez reéssayer.')
            }
            load.dismiss()

        }
    }

    const all_mess = computed(() => {
        return messages.value
    })

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
    const audios = ref<{
        id: number,
        player: AudioComp
    }[]>([])

    const launchers = ref<{ slug: string, launcher: Launcher | null }[]>([])
    const l_accepted = ref(false)
    const l_refused = ref(false)

    const payment = ref<{
        transactionId: string,
        state: string
    } | null>(null)
    watch(payment, (newp, oldp) => {
        store_obj('payment', JSON.stringify(newp))
        if (newp) {
            set_abon(newp)
        }
    }, { deep: true })

    const set_abon = async (pay: {
        transactionId: string,
        state: string
    }) => {
        const load = await showLoading('Activation du ticket...')
        try {
            const resp = await axios.post('api/set_abon/', {
                transactionId: pay.transactionId,
                state: pay.state
            }, {
                headers: {
                    Authorization: `Bearer ${await access_tok(router, load)}`
                }
            })
            if (resp.data['done']) {
                user.value = resp.data['result']
                payment.value = null
                if (pay.state != 'free') all_swipe.value[day_string.value] = 5
                presentToast('top', 'Ticket mis à jour avec succès', "success", 5000)
            } else {
                show_alert('Paiement invalide', "L'identifiant de paiement est incorrecte. Veuillez reéssayer.")
            }
            load.dismiss()
        } catch (e) {
            load.dismiss()
            show_alert('Erreur inattendue', "Une erreur est survenue lors de la mise à jour de votre ticket, veuillez reéssayer.")
        }

    }

    const state_obj = ref<{
        state: string,
        target: number,
        old_pk: number
    }>({
        state: 'on',
        target: 0,
        old_pk: 0
    })

    const profil_stores = ref<ProfilStores[]>([])
    watch(profil_stores, async (newps, oldps) => {
        await store_obj('profil_stores', JSON.stringify(profil_stores.value))
        for (const ps of newps) {
            if (ps.path != '') {
                add_ps_url(ps)
            } else {
                if (ps.url) if (ps.url != '') set_path(ps.url)
            }
        }
    }, { deep: true })

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

    const add_ps_url = (ps: ProfilStores) => {
        if (!ps_url.value.filter(e => e.store.url == ps.url)[0]) {
            ps_url.value.push({
                store: ps,
                src: ''
            })
        }
    }
    const get_or_add = (url: string) => {

        if (!profil_stores.value.filter(e => e.url == url)[0]) profil_stores.value.push({
            url,
            path: ''
        })
        return profil_stores.value.filter(e => e.url == url)[0]
    }

    const f_url = (url: string) => {
        const ps = get_or_add(url)
        if (ps.path) {
            const psu = ps_url.value.filter(e => e.store.url == url)[0]
            if (psu) if (psu.src != '') return psu.src
        }

        return user.value?.sex == 'Homme' ? '../../imgs/woman.png' : '../../imgs/man.png'
    }

    const waiting_room = ref('')
    const g_load = ref<any>()
    const force_room = async () => {
        g_load.value = await showLoading('Initialisation...')
        setTimeout(() => {
            send_essentials()
        }, 20)
    }

    const notifs = ref<Notif[]>([])
    const get_notifs = computed(() => {
        return notifs.value.sort((a, b) => toDate(b.created_at).getTime() - toDate(a.created_at).getTime())
    })
    watch(notifs, (newn, oldn) => {
        store_obj('notifs', JSON.stringify(newn))
    }, { deep: true })

    const seen_notifs = ref<number[]>([])
    watch(seen_notifs, (news, olds) => {
        store_obj('seen_notifs', JSON.stringify(news))
    }, { deep: true })

    const has_new_notifs = computed(() => {
        return notifs.value.filter(e => !seen_notifs.value.includes(e.id)).length
    })

    const initiate_chat = async (auth: number, targ: number) => {
        g_load.value = await showLoading('Initialisation')
        setTimeout(() => {
            send(JSON.stringify({
                'type': 'initiate_chat',
                'result': {
                    'author': auth,
                    'target': targ
                }
            }))
        }, 20)
    }

    const come_first = ref(false)
    watch(come_first, (newc, oldc) => {
        if (newc) {
            store_obj('come_first', 'yes')
        }
    })

    const only_verified = ref<number[]>([])

    const is_blocked = ref(false)

    const can_sl = computed(() => {
        const typ = user.value ? (user.value.cur_abn ? user.value.cur_abn.get_typ.name : 'free') : 'free'
        const this_week = all_slikes.value[sem_string.value]
        if (!this_week) all_slikes.value[sem_string.value] = 0
        return all_slikes.value[sem_string.value] < spl_invents.value[typ]
    })

    const cangr_swipe = computed(() => {
        if (!groups.value.length) return false;
        if (!gr_limits.value) return false
        if (!gr_swipe.value[day_string.value]) gr_swipe.value[day_string.value] = 0
        let abn = 'free'
        if (user.value?.cur_abn) abn = user.value.cur_abn.get_typ.name
        return gr_swipe.value[day_string.value] < gr_limits.value[abn].swipe
    })

    const why_cantgr_swipe = computed(() => {
        if (!groups.value.length) return 'nogroup'
        else return 'abn'
    })

    const ordered_groups = computed(() => {
        return groups.value.sort((a, b) => toDate(last_messagegr(b)).getTime() - toDate(last_messagegr(a)).getTime())
    })

    const get_grooms = (grps: Group) => {
        return grps.rooms.sort((a, b) => toDate(b.created_at).getTime() - toDate(a.created_at).getTime())
    }

    const all_rooms = computed(() => {
        let rroms = [] as Room[]
        for (const group of groups.value) {
            for (const ro of group.rooms) rroms.push(ro)
        }
        rroms = rroms.concat(rooms.value)
        return rroms
    })


    const send_state = (is_group = false, slug: string) => {
        if (!mess_recap.value[day_string.value]) mess_recap.value[day_string.value] = {
            sroom: [],
            groom: []
        }
        let abn = 'free';
        if (user.value?.cur_abn) abn = user.value.cur_abn.get_typ.name
        if (is_group && gr_limits.value) {
            return gr_limits.value[abn].discuss > mess_recap.value[day_string.value].groom.filter(e => e != slug).length ? 'on' : 'limited'
        } else {
            return day_discuss.value[abn] > mess_recap.value[day_string.value].sroom.filter(e => e != slug).length ? 'on' : 'limited'
        }
    }

    return {
        can_anonym,
        user,
        update_user,
        excepts,
        can_swipe,
        swipe_left,
        swipe_right,
        why_cant_swipe,
        build_card,
        plikes,
        matches,
        gmatches,
        has_new,
        proposed_rooms,
        gained_rooms,
        user_matches,
        messages,
        rooms,
        get_room_from_message,
        last_message,
        not_seens,
        get_room_messages,
        get_room_,
        delete_room,
        next_niveau,
        storeFs,
        add_store,
        send,
        is_match,
        delete_message,
        all_mess,
        find_next,
        charged_files,
        audios,
        launchers,
        refuse_la,
        l_accepted,
        l_refused,
        has_sen,
        payment,
        state_obj,
        f_url,
        waiting_room,
        has_new_room,
        force_room,
        seen_notifs,
        notifs,
        get_notifs,
        has_new_notifs,
        initiate_chat,
        seen_rooms,
        come_first,
        only_verified,
        day_discuss,
        day_mess,
        check_first_come,
        offnonym,
        here_first,
        is_blocked,
        oth_matches,
        not_matches,
        has_post,
        total_swipe,
        can_sl,
        all_slikes,
        gr_swipe,
        new_essentials,
        sem_string,
        cangr_swipe,
        why_cantgr_swipe,
        swipe_rightgr,
        my_groups: groups,
        swipe_leftgr,
        g_load,
        has_new_groom,
        ordered_groups,
        get_grooms,
        quit_group,
        all_rooms,
        send_state,
        recent_del,
        mess_recap,
        del_users,
        actual_prev,
        actual_page,
        qosic
    }
})
