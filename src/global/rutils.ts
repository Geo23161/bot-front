import { alertController, loadingController, toastController } from "@ionic/vue"
import axios from "axios"
import { Router } from "vue-router"

const DEFAULT_BASE = 'user_store:'

export const get_obj = (key: string) => {


    return localStorage.getItem(DEFAULT_BASE + key)
}

export const store_obj = (key: string, obj: any) => {
    localStorage.setItem(DEFAULT_BASE + key, obj)
}

export const remove_obj = (key: string) => {
    localStorage.removeItem(DEFAULT_BASE + key)
}

export const access_tok = async (router: Router, load: HTMLIonLoadingElement | undefined) => {
    const token: string | null = get_obj('tokens')
    if (!token) {
        return ''
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
                    
                    return ''
                }
            }
        }
    }
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

export const toDate = (utc: string) => {
    return (new Date(utc))
}

export const is_online = (time: number) => {
    return ((new Date).getTime() - time) < 70000
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
        return elt.scrollHeight - elt.scrollTop <= elt.clientHeight + 250
    }
    return false
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

export const quick_loading = async () => {
    const load = await showLoading('Loading...')
    setTimeout(() => {
        load.dismiss()
    }, 2000)
} 
