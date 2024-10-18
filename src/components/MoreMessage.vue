<template>
    <ion-modal
      mode="ios"
      :is-open="isOpen"
      :breakpoints="[0.16, 0.25]"
      :initial-breakpoint="0.16"
      @didDismiss="close"
    >
      <ion-content>
        <div class="body">
          <div class="contain" >
            <button class="feature rose clic" @click="done('img')" >
                <ion-icon :icon="images" style=" font-size: 8vw;  " ></ion-icon>
            </button>
            <button class="feature yellow clic" @click="done('vid')" >
                <ion-icon :icon="videocam" style=" font-size: 8vw;  " ></ion-icon>
            </button>
            <button class="feature mus clic" @click="done('aud')" >
                <ion-icon :icon="musicalNote" style=" font-size: 8vw;  " ></ion-icon>
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </template>
  
  <style scoped>
  .clic:active{
    box-shadow: none;
  }
  .mus{
    background-color: rgb(0, 201, 10);
    color: white;
    box-shadow: 0 15px 25px -3px rgba(0, 201, 10, 0.99), 0 4px 6px -2px #17a74929;
  }
  .yellow{
    background-color: rgb(124, 9, 255);
    color: white;
    box-shadow: 0 15px 25px -3px rgb(124, 9, 255, 0.99), 0 4px 6px -2px #17a74929;
  }
  .rose{
    background-color: rgb(255, 9, 91);
    color: white;
    box-shadow: 0 15px 25px -3px rgb(255, 9, 91, 0.99), 0 4px 6px -2px #17a74929;
}
  .feature{
    width: 18vw;
    height: 18vw;
    border-radius: 15px;
  }
  .contain {
    padding: 2vh 1vh;
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  .btit {
    padding-top: 0.3rem;
    font-size: 1.3rem;
    font-weight: bolder;
    text-align: center;
    color: white;
  }
  
  .body {
    height: 100%;
    width: 100%;
    padding: 1rem;
    background-image: linear-gradient(to right, #202020, #110508 60%, #202020);
    font-family: "Poppins";
  }
  </style>
  
  <script lang="ts">
  import { defineComponent, defineEmits } from "vue";
  import { IonModal, IonContent, IonIcon } from "@ionic/vue";
  import { arrowForward, images, musicalNote, videocam } from "ionicons/icons";
  import { useRouter } from "vue-router";
  
  export default defineComponent({
    components: {
      IonModal,
      IonContent,
      IonIcon
    },
    props: {
      isOpen: Boolean,
    },
    setup(props, ctx) {
      const emits = defineEmits(["close", "done"]);
      const close = () => {
        ctx.emit("close");
      };
      const done = (typ : string) => {
        ctx.emit("done", typ)
      }
      const router = useRouter();
      return {
        close,
        router,
        arrowForward,
        done,
        images,
        videocam,
        musicalNote
      };
    },
  });
  </script>