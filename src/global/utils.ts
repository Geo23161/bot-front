import { Storage, Drivers } from "@ionic/storage"
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { alertController, loadingController, isPlatform, toastController } from "@ionic/vue"
import { Router, useRouter } from "vue-router";
import axios from "axios";
import { Card, Group, Profil, Room, StoreFiles, User } from "./types";
import unidecode from 'unidecode';
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core"
import { ref } from "vue"
import { Geolocation } from "@capacitor/geolocation"



export const get_position = async () => {
    let quart = {
        lat : 0,
        lng : 0
    }
    const is_native = isPlatform('android') || isPlatform("ios")
    if (!is_native) {
        if (!navigator.geolocation) return null;
        navigator.geolocation.getCurrentPosition(pos => (quart = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        }))
    } else {
        const coords = await Geolocation.getCurrentPosition()
        quart = {
            lat: coords.coords.latitude,
            lng: coords.coords.longitude
        }
    }
    return quart
}

export const set_notifications = () => {
    const platform = ref("android");
    const setPlatform = () => {
        if (isPlatform("ios")) platform.value = "ios";
        if (isPlatform("mobileweb")) platform.value = "web";
    };
    setPlatform();
    const registerNotifications = async () => {
	
	 if(platform.value != 'android') {
	 let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === "prompt") {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== "granted") {
            throw new Error("User denied permissions!");
        }
	 }
        await PushNotifications.register();
    };
    
   registerNotifications();
	
    const router = useRouter()

    const addListerners = async () => {
        await PushNotifications.addListener("registration", async (token) => {
            axios({
                url: "api/devices/",
                method: "POST",
                data: {
                    registration_id: token.value,
                    type: platform.value,
                },
                headers: {
                    Authorization: `Bearer ${await access_tok(router, undefined)}`,
                },
            })
                .then((resp) => {
                    store_obj('notif_registred', 'true')
                })
                .catch((err) => {
                    console.log(err);
                });
        });
        await PushNotifications.addListener("registrationError", (err) => {
            console.error("Registration error: ", err.error);
        });
    }
	addListerners();
}

export const get_obj = async (key: string) => {
    const storage = new Storage({
        name: 'user_store',
        driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
    });

    await storage.defineDriver(CordovaSQLiteDriver);
    await storage.create()
    return await storage.get(key)
}

export const store_obj = async (key: string, obj: any) => {
    const storage = new Storage({
        name: 'user_store',
        driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
    });
    await storage.defineDriver(CordovaSQLiteDriver);
    await storage.create()
    await storage.set(key, obj)
}

export const remove_obj = async (key: string) => {
    const storage = new Storage({
        name: 'user_store',
        driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
    });

    await storage.defineDriver(CordovaSQLiteDriver);
    await storage.create()

    await storage.remove(key)
}

export const format_all = async () => {
    const storage = new Storage({
        name: 'user_store',
        driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
    });

    await storage.defineDriver(CordovaSQLiteDriver);
    await storage.create()
    await storage.clear()
}

export const showLoading = async (mess: string) => {
    const loading = await loadingController.create({
        message: mess,
        mode: 'ios'
    });
    loading.present();
    return loading
};

export const show_alert = async (title: string, mess: string) => {
    const alert = await alertController.create({
        header: title,
        message: mess,
        buttons: ["OK"],
        mode: 'ios'
    });
    await alert.present();
};

export const show_warn = async (title: string, mess: string, oktext: string, handle: (param: any, oth : any) => any, param: any, notext = "Cancel", is_group = false) => {
    const alert = await alertController.create({
        header: title,
        message: mess,
        buttons: [
            {
                text: notext,
                role: 'cancel',
            },
            {
                text: oktext,
                role: 'confirm',
                handler: () => {
                    handle(param, is_group)
                },
            },
        ],
        mode: 'ios',
    });

    await alert.present();
};

export const access_tok = async (router: Router, load: HTMLIonLoadingElement | undefined) => {
    const token: string | undefined = await get_obj('tokens')
    if (!token) {
        if (load) load.dismiss();
        let idents = await get_obj('ksjfniusfgiunsfjnfsin')
                        
                        idents = JSON.parse(idents);
                        
                        if (idents) {
                            const { email, password } = idents
                            try {
                                const resp = await axios.post('token/', {
                                    email,
                                    password
                                })
                                store_obj('tokens', JSON.stringify(resp.data))
                                return resp.data['access'] as string
                            } catch(e) {
                                console.log(e)
                            }
                        }
        return router.push(`/login`)
    }
    else {
        const json_tok = JSON.parse(token)
        try {
            const resp = await axios({
                url: 'api/ping',
                method: 'HEAD',
                headers: {
                    Authorization: `Bearer ${json_tok.access}`
                },
            })
            return json_tok.access as string
        } catch (err: any) {
            if (err.response.status == 401) {
                const form = new FormData()
                form.append('refresh', json_tok.refresh)
                try {
                    const refresh_res = await axios({
                        url: 'token/refresh/',
                        method: 'POST',
                        data: form
                    })
                    json_tok.access = refresh_res.data['access']
                    store_obj('tokens', JSON.stringify(json_tok))
                    return refresh_res.data['access'] as string
                } catch (err: any) {
                    if (err.response.status == 401) {
                        let idents = await get_obj('ksjfniusfgiunsfjnfsin')
                        
                        idents = JSON.parse(idents);
                        
                        if (idents) {
                            const { email, password } = idents
                            try {
                                const resp = await axios.post('token/', {
                                    email,
                                    password
                                })
                                store_obj('tokens', JSON.stringify(resp.data))
                                return resp.data['access'] as string
                            } catch(e) {
                                console.log(e)
                            }
                        }
                    }
                    return router?.push(`/login`)
                }
            }
        }
    }
}

export const room_slug = (pk1: number, pk2: number, is_group = false) => {
    const pks = [pk1, pk2].sort((a, b) => a - b)
    return ( is_group ? 'g' : '') + `${pks[0]}m${pks[1]}`
}

export const toDate = (utc: string) => {
    return (new Date(utc))
}

export function rechercheMotSansAccents(chaine: string, motRecherche: string): boolean {
    if (!motRecherche) return false
    // Translitère la chaîne d'entrée et le mot de recherche en caractères ASCII
    const chaineSansAccents = unidecode(chaine).toLowerCase();
    const motRechercheSansAccents = unidecode(motRecherche).toLowerCase();
    // Utilise une expression régulière pour rechercher le mot dans la chaîne
    const regex = new RegExp(motRechercheSansAccents, 'gi');
    return regex.test(chaineSansAccents);
}

export const is_online = (time: number) => {
    return ((new Date).getTime() - time) < 70000
}

export const findTime = (created: string) => {
    const today = new Date();
    const created_at = new Date(created)
    const time = "";
    const diffDays = Math.round((today.getTime() - created_at.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays == 0) {
        return `${created_at.getHours() < 10 ? "0" : ""}${created_at.getHours()}:${created_at.getMinutes() < 10 ? "0" : ""}${created_at.getMinutes()}`
    } else if (Math.abs(diffDays) == 1) {
        return `${created_at.getHours() < 10 ? "0" : ""}${created_at.getHours()}:${created_at.getMinutes() < 10 ? "0" : ""}${created_at.getMinutes()}` + ' hier'
    } else if (Math.abs(diffDays) == 2) return "Avant-Hier";
    else {
        return `${created_at.getDate()}/${created_at.getMonth()}/${created_at.getFullYear()}`
    }

}

function getMonthName(monthNumber: number) {
    if ( monthNumber > 12) {
        return "Invalid month number";
    }

    const monthNames = [
        "Jan", "Fev", "Mar", "Avr",
        "Mai", "Jun", "Jul", "Aug",
        "Sept", "Oct", "Nov", "Dec"
    ];

    return monthNames[monthNumber];
}

export const format_date = (date: Date) => {
    const now = new Date()
    const day = `${date.getDate()} ${getMonthName(date.getMonth())} ${(now.getFullYear() == date.getFullYear()) ? '' : date.getFullYear()}. ${(date.getHours() < 10 ? '0' : '') + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`

    return day
}

export const get_ratio = (src: string,) => {
    const img = new Image()

    img.src = src
    img.addEventListener('load', (ev) => {
        return img.naturalHeight / img.naturalWidth
    })
}

export function generateUniqueFileName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Ajoute un zéro en tête si nécessaire
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    // Concatène toutes les parties pour former le nom du fichier
    const fileName = `${year}${month}${day}_${hours}${minutes}${seconds}${milliseconds}`;

    return fileName;
}

export function generateNegativeRandomNumber(max: number): number {
    // Générez un nombre aléatoire entre 1 et max
    const randomNumber = Math.random() * max;

    // Renvoyez le nombre négatif
    return -randomNumber;
}

export function formatBlobSize(blob: Blob): string {
    const bytes = blob.size;
    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;
    const gigabyte = megabyte * 1024;

    if (bytes < kilobyte) {
        return bytes + ' o';
    } else if (bytes < megabyte) {
        return (bytes / kilobyte).toFixed(2) + ' Ko';
    } else if (bytes < gigabyte) {
        return (bytes / megabyte).toFixed(2) + ' Mo';
    } else {
        return (bytes / gigabyte).toFixed(2) + ' Go';
    }
}

export const extract_frames = (vid: any, callback: (b: Blob | null) => void, index: number, is_url = false) => {
    const video = document.createElement("video");
    const file = vid;
    const fileURL = is_url ? vid : URL.createObjectURL(file);
    video.src = fileURL;

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth * 3 / 4;
    video.addEventListener('loadeddata', function () {
        reloadRandomFrame();
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight
    }, false);

    video.addEventListener('seeked', function () {
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(callback);
    }, false);


    function reloadRandomFrame() {
        if (!isNaN(video.duration)) {
            const rand = Math.round(Math.random() * video.duration * 1000) + 1;
            video.currentTime = rand / 1000;
        }
    }
}

export function copierTexteDansPressePapiers(texte: string): void {
    // Créez un élément textarea temporaire pour stocker le texte à copier.
    const textarea = document.createElement("textarea");
    textarea.value = texte;

    // Assurez-vous que l'élément textarea est hors de la vue de l'utilisateur.
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";

    // Ajoutez l'élément textarea au DOM.
    document.body.appendChild(textarea);

    // Sélectionnez et copiez le texte dans le presse-papiers.
    textarea.select();
    document.execCommand("copy");

    // Supprimez l'élément textarea temporaire du DOM.
    document.body.removeChild(textarea);
}

export const presentToast = async (position: 'top' | 'middle' | 'bottom', text: string, color = 'primary', duration = 3500) => {
    const toast = await toastController.create({
        mode: 'ios',
        message: text,
        position: position,
        duration: duration,
        color: color,
    });
    await toast.present();
}

export function scroll_bot(id: string) {
    const elt = document.getElementById(id)

    if (elt) {
        elt.scrollTop = elt.scrollHeight - elt.clientHeight
    }
}

export function isScrolled(id: string) {
    const elt = document.getElementById(id)

    if (elt) {
        return elt.scrollHeight - elt.scrollTop <= elt.clientHeight + 75
    }
    return false
}

export const get_day_sem = (weekD: number) => {
    let day = "";
    switch (weekD) {
        case 0:
            day = `Dim`;
            break;
        case 1:
            day = 'Lun';
            break
        case 2:
            day = 'Mar';
            break
        case 3:
            day = 'Mer';
            break
        case 4:
            day = 'Jeu';
            break
        case 5:
            day = 'Ven'
            break
        case 6:
            day = 'Sam'
            break
    }
    return day;
}

export const formatOnline = (time: string) => {
    const today = new Date();
    const last = new Date(time);
    const diff = (today.getTime() - last.getTime()) / 1000
    const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 70) return 'en ligne';
    else {
        if (diffDays == 0) {
            return `vu à ${last.getHours() < 10 ? "0" : ""}${last.getHours()}:${last.getMinutes() < 10 ? "0" : ""}${last.getMinutes()}`
        } else if (Math.abs(diffDays) == 1) {
            return `hier à ${last.getHours() < 10 ? "0" : ""}${last.getHours()}:${last.getMinutes() < 10 ? "0" : ""}${last.getMinutes()}`
        } else if (Math.abs(diffDays) == 2) {
            return `avant-hier à ${last.getHours() < 10 ? "0" : ""}${last.getHours()}:${last.getMinutes() < 10 ? "0" : ""}${last.getMinutes()}`
        }
        else if (Math.abs(diffDays) < 7) {
            return `${get_day_sem(last.getDay())} à ${last.getHours() < 10 ? "0" : ""}${last.getHours()}:${last.getMinutes() < 10 ? "0" : ""}${last.getMinutes()}`
        } else if (Math.abs(diffDays) == 7) {
            return `il y a une semaine`
        }
        else if (Math.abs(diffDays) < 30) {
            return `il y a ${Math.abs(diffDays)} jours`
        } else {
            return `le ${last.getDate()}/${last.getMonth()}/${last.getFullYear()}`
        }
    }

}

export const base64toBlob = (base64Data: any, contentType: any) => {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize;
        const end = Math.min(begin + sliceSize, bytesLength);

        const bytes = new Array(end - begin);
        for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

export function estDansLaPlagePermise(): boolean {
  const maintenant = new Date();
  const jourDeLaSemaine = maintenant.getDay(); // 0 pour dimanche, 1 pour lundi, ..., 6 pour samedi
  const heureActuelle = maintenant.getHours();

  // Vérifier si c'est vendredi
  if (jourDeLaSemaine === 5) {
    // Vérifier si l'heure est après 18h
    if (heureActuelle >= 18) {
      return true;
    }
  }

  // Vérifier si c'est samedi
  if (jourDeLaSemaine === 6) {
    // Toujours considéré comme dans la plage permise
    return true;
  }

  // Vérifier si c'est dimanche
  if (jourDeLaSemaine === 0) {
      return true;
  }

  // En dehors de la plage permise
  return false;
}

export function getDurationSince(date: Date): string {
    const now = new Date();
    const timeDifference = now.getTime() - date.getTime();

    const years = Math.floor(timeDifference / (365 * 24 * 60 * 60 * 1000));
    const months = Math.floor(timeDifference / (30 * 24 * 60 * 60 * 1000));
    const days = Math.floor(timeDifference / (24 * 60 * 60 * 1000));

    if (years > 1) {
        return `Depuis ${years} ${years === 1 ? 'an' : 'ans'}`;
    } else if (months > 1) {
        return `Depuis ${months} ${months === 1 ? 'mois' : 'mois'}`;
    } else {
        return `Depuis ${days} ${days === 1 ? 'jour' : 'jours'}`;
    }
}

export function calculerAge(dateNaissanceStr: string): number {
    // Convertir la chaîne de caractères en objet Date
    const dateNaissance = new Date(dateNaissanceStr);

    // Obtenir la date actuelle
    const dateActuelle = new Date();

    // Calculer la différence entre les deux dates en millisecondes
    const differenceEnMillisecondes = dateActuelle.getTime() - dateNaissance.getTime();

    // Convertir la différence en années
    const ageEnAnnees = differenceEnMillisecondes / (1000 * 60 * 60 * 24 * 365.25);

    // Arrondir à l'entier le plus proche
    const ageArrondi = Math.floor(ageEnAnnees);

    return ageArrondi;
}

export function getCurrentWeekString(): string {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
  
    const startMonth = startOfWeek.toLocaleString('default', { month: 'short' });
    const endMonth = endOfWeek.toLocaleString('default', { month: 'short' });
  
    const weekString = `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${currentDate.getFullYear()}`;
  
    return weekString;
  }

export const mgrp_name = (groups : Group[], room : Room , id : number) => {
    let the_name = ""
    for(const us of get_rooms_users(groups, room)) {
        if(us.id != id) {
            the_name += ` ${us.prenom},`
        }
    }
    if (the_name[the_name.length -1] == ',') the_name = the_name.slice(0, the_name.length - 1)
    
    return the_name
}

export const mgrp_name_ = (grps : Group | Room, id : number) => {
    let the_name = ""
    for(const us of grps.users) {
        if(us.id != id) {
            the_name += ` ${us.prenom},`
        }
    }
    if (the_name[the_name.length -1] == ',') the_name = the_name.slice(0, the_name.length - 1)
    
    return the_name
}

export const get_rooms_users = ( groups : Group[], room : Room ) => {
	const group = groups.filter(e => room.get_groups?.includes(e.id))[0]
	
	return room.users.filter(e => !group.users.filter(el => el.id == e.id)[0])

}


