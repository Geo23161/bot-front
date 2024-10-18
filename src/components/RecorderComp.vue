<template>
    <ion-modal :breakpoints="[0.5, 0.7]"
      :initial-breakpoint=" 0.65" :is-open="isOpen" @didDismiss="close" >
      <ion-content>
        <div class="body">
          <div class="sbody">
            <div class="header">
              <div  class="menu" @click="close()">
                <ion-icon :icon="clos" />
              </div>
              <div>
                <div  style="font-weight: bold; font-size: 1.1rem">
                  Note Vocale
                </div>
              </div>
            </div>
            <div class="mbody">
              <div class="mstitle">
                ( Appuyez pour arrêter ou démarrer l'enregistrement )
              </div>
              <div class="recorder_c">
                <button
                  @click="recording ? stop_recording() : start_recording()"
                  class="recorder"
                  :class="{ red_: recording && count % 2 }"
                >
                  <ion-icon
                    style="position: relative; top: 0.1rem"
                    v-show="!recording"
                    :icon="mic"
                  />
                  <ion-icon
                    :icon="stop"
                    v-show="recording"
                    style="position: relative; top: 0.1rem"
                  />
                </button>
              </div>
              <div class="count_c">{{ timer }}</div>
              <div v-if="sound != ''" class="audio">
                <button @click="toogle_playing()" class="plays">
                  <ion-icon :icon="is_playing ? pause : play" />
                </button>
                <div class="range">
                  <ion-range
                    @ionChange="(e) => set_current((e.target.value).toString())"
                    :value="parseInt(myval)"
                    mode="md"
                  ></ion-range>
                  <div class="details">
                    <div>{{ current_a }}</div>
                    <div>{{ total_a }}</div>
                  </div>
                </div>
              </div>
              <div class="but">
                <div class="mybut">
                  <div @click="(sound = ''), (sound_pk = 0)" class="butt none">
                    Effacer
                  </div>
                  <div @click=" recording ? stop_recording(true) : done()" class="butt purple">{{ recording ? 'Envoyer' : 'Envoyer' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </template>
  
  <style scoped>
  .none:active {
    background: #ece8fdfd;
  }
  
  .purple:active {
    background: #9c86ff;
  }
  
  .purple {
    background: linear-gradient(to left, rgba(255, 255, 255, 0.336), transparent);
    background: #fb4073;
    color: white;
  }
  
  .butt {
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
    padding-left: 0.6rem;
    padding-right: 0.6rem;
    text-align: center;
    width: 50%;
    border-radius: 15px;
  }
  
  .mybut {
    border-radius: 15px;
    background-color: #dcd9ee9a;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .but {
    padding-top: 6vh;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  
  .details {
    display: flex;
    justify-content: space-between;
    font-size: 0.73rem;
    color: rgb(97, 97, 97);
    margin-top: -10px;
  }
  
  ion-range {
    --bar-background-active: #fb4073;
    --knob-background: #fb4073;
    --knob-size: 12px;
  }
  
  .range {
    flex-grow: 1;
    padding: 0.4rem;
  }
  
  .plays {
    width: 45px;
    height: 45px;
    min-width: 45px;
    min-height: 45px;
    border-radius: 100%;
    font-size: 1.5rem;
    color: #fb4073;
  }
  
  .audio {
    margin-top: 0.8rem;
    padding-left: 0.4rem;
    padding-right: 0.4rem;
    display: flex;
    align-items: center;
    border-style: solid;
    border-width: 0.5px;
    border-color: rgb(41, 41, 44);
    border-radius: 15px;
  }
  
  .count_c {
    text-align: center;
    font-size: 1.05rem;
    color: #0e0a1f;
    font-weight: bold;
  }
  
  .recorder:active {
    box-shadow: none;
  }
  
  .red_ {
    background: rgb(89, 0, 255) !important;
    color: white;
  }
  
  .recorder {
    width: 80px;
    height: 80px;
    border-radius: 100%;
    background: #fb4073;
    color: white;
    font-size: 2rem;
    box-shadow: 0 10px 15px -3px #fb407365, 0 4px 6px -2px #17a74929;
    transition: all 0.2s ease-in-out;
  }
  
  .recorder_c {
    padding-top: 2vh;
    padding-bottom: 2vh;
    display: flex;
    justify-content: space-around;
  }
  
  .mstitle {
    font-size: 0.9rem;
    text-align: center;
    padding-top: 0.7rem;
    padding-bottom: 1vh;
  }
  
  .mtitle {
    font-size: 1.3rem;
    font-weight: bold;
    text-align: center;
    padding-top: 1rem;
  }
  
  .mbody {
    padding-top: 3vh;
  }
  
  .sep {
    padding-top: 0.6rem;
    padding-bottom: 0.6rem;
  }
  
  .menu:active,
  .menu_:active {
    box-shadow: none;
    background: white;
    color: #fb4073;
  }
  
  .menu {
    padding-top: 0.4rem;
    padding-bottom: 0.2rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    background-color: #ff5959;
    color: white;
    font-weight: bold;
    border-radius: 10px;
    box-shadow: 0 10px 15px -3px #ff595965, 0 4px 6px -2px #17a74929;
  }
  
  .header {
    padding-bottom: 0.8rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .sbody {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 1rem;
  }
  
  .body {
    min-height: 100vh;
    width: 100%;
    padding: 10px;
    background-image: linear-gradient(to right, #f5f3fd, #e9e4ff 60%, #f5f3fd);
    font-family: "Poppins";
    overflow: scroll;
  }
  </style>
  
<script lang="ts">
  import { computed, defineComponent, defineEmits, ref, toRef, watch } from "vue";
  import { close as clos, mic, play, stop, pause } from "ionicons/icons";
  import { IonModal, IonContent, IonIcon, IonRange } from "@ionic/vue";
  import {
    access_tok,
    base64toBlob,
    showLoading,
    show_alert,
    store_obj,
  } from "@/global/utils";
  import { VoiceRecorder } from "capacitor-voice-recorder";
  import axios from "axios";
  import { useRouter } from "vue-router";
  
  export default defineComponent({
    props: {
      isOpen: Boolean,
    },
    components: {
      IonModal,
      IonContent,
      IonIcon,
      IonRange,
    },
    setup(props, ctx) {
      const emits = defineEmits(["close", "done"]);
      const close = () => {
        if(recording.value) stop_recording()
        ctx.emit("close");
      };
      const done = () => {
        if(sound.value == '') close()
        ctx.emit('done', {blob : audio_blob.value, size : total_a.value})
      }
      const sound = ref("");
      const sound_pk = ref(0);
      const is_op = toRef(props, "isOpen");
      watch(is_op, (newo, oldo) => {
        if(newo) sound.value = '', start_recording()
      })
      const count = ref(0);
      setInterval(() => {
        count.value++;
      }, 500);
      //Mic
      const recording = ref(false);
      const timer = ref("00:00");
      const get_time_format = (time: number) => {
        let minutes: string | number = Math.floor(time / 60);
        let seconds: string | number = Math.floor(time - minutes * 60);
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;
        return `${minutes}:${seconds}`;
      };
      const update_timer = (time: number) => {
        timer.value = get_time_format(time);
      };
      let interval: any = 0;
      const start_recording = async () => {
        if(is_playing.value) toogle_playing()
        const has_perm = await VoiceRecorder.hasAudioRecordingPermission();
        if (!has_perm.value) {
          const perm = await VoiceRecorder.requestAudioRecordingPermission();
          if (perm.value) has_perm.value = true;
          else {
            show_alert(
              "Permission refusée",
              "Vous devez accorder a Lovelee la perssion d'enregistrer"
            );
            recording.value = false;
          }
        }
        if (has_perm.value) {
          recording.value = true;
          const record = await VoiceRecorder.startRecording();
          if (!record.value)
            (recording.value = false),
              show_alert(
                "Erreur !",
                "Une erreur est survenue. Veuillez reésayer plus tard."
              );
        }
        let time = 0;
        interval = setInterval(() => {
          time++;
          record_time.value = time;
          update_timer(time);
        }, 1000);
      };
      const record_time = ref(0)
      const audio_blob = ref();
      const close_recording = async () => {
        const record = await VoiceRecorder.stopRecording();
        if (interval) clearInterval(interval), update_timer(0);
        recording.value = false;
        interval = 0;
      };
      const stop_recording = async (action? : boolean) => {
        const record = await VoiceRecorder.stopRecording();
        recording.value = false;
        if (interval) clearInterval(interval), update_timer(0);
        const base64 = `data:${record.value.mimeType};base64,${record.value.recordDataBase64}`;
        const blob = base64toBlob(
          record.value.recordDataBase64,
          record.value.mimeType
        );
        audio_blob.value = blob;
        sound.value = URL.createObjectURL(blob)
        interval = 0;
        duration.value = record_time.value;
        record_time.value = 0
        if(action) done()
      };
      /* const upload_sound = async () => {
        const load = await showLoading("Loading...");
        const form = new FormData();
        form.append("file", audio_blob.value);
        const resp = await axios.post("api/upload_sound/", form, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${await access_tok( useRouter(), load)}`,
          },
        });
        if(resp.data['done']){
          sound.value = resp.data['result'].get_url
          sound_pk.value = resp.data['result'].id
          load.dismiss()
        }
      }; */
  
      //Audio
      const is_playing = ref(false);
      const total_a = computed(() => {
        return get_time_format(duration.value);
      });
      const current_a = ref("00:00");
      const duration = ref(0);
      let audio_interval : NodeJS.Timer | number = 0;
      const myval = ref("0");
      const audio = ref<HTMLAudioElement | null>();
      watch(sound, (news, olds) => {
        myval.value = "0"
        current_a.value = "00:00"
        audio.value = null;
        if (news != "") {
          const audi = document.createElement("audio");
          audi.src = sound.value;
          audio.value = audi;
          audio.value.addEventListener("pause", () => {
            is_playing.value = false;
          });
          audio.value.addEventListener("ended", () => {
            is_playing.value = false;
            set_current("0")
            current_a.value = "00:00"
            myval.value = "0"
          });
          audio.value.addEventListener("play", () => {
            is_playing.value = true;
          });
          audio.value.addEventListener("playing", () => {
            is_playing.value = true;
          });
          audio.value?.addEventListener('durationchange', () => {
            if(audio.value) if(audio.value.duration != Infinity) duration.value = audio.value?.duration
            })
        }
      });
      audio_interval = setInterval(() => {
        if (is_playing.value && audio.value) {
          current_a.value = get_time_format(audio.value.currentTime as number);
          myval.value = (
            (audio.value.currentTime / duration.value) *
            100
          ).toString();
        }
      }, 1000);
      const set_current = (val: string) => {
        if (audio.value) {
          audio.value.currentTime = (parseInt(val) / 100) * duration.value;
        }
      };
      const toogle_playing = () => {
        if (audio.value) {
          if (!is_playing.value) audio.value.play();
          else {
            audio.value.pause();
          }
        }
      };
      /* const validate = async () => {
        if(sound.value == '') return await show_alert("Impossible de continuer", "Aucun enregistrement trouvé. Veuillez enregistrer votre note vocale.")
        const load = await showLoading("Enregistrement...");
        const resp = await axios.post('api/set_sound/', {pk : sound_pk.value, duration : duration.value}, {
          headers: {
            Authorization: `Bearer ${await access_tok(useRouter(), load)}`,
          },
        })
        if(resp.data['done']){
          store_obj(JSON.stringify(resp.data["result"]), "profil");
          load.dismiss();
          done()
        }
      } */
      return {
        close,
        mic,
        play,
        stop,
        sound,
        timer,
        recording,
        start_recording,
        stop_recording,
        close_recording,
        count,
        pause,
        toogle_playing,
        total_a,
        current_a,
        myval,
        set_current,
        is_playing,
        sound_pk,
        clos,
        done
      };
    },
  });
</script>