<template>
    <ion-modal :is-open="isOpen">
      <ion-content>
        <div class="body">
          <div class="header">
            <button @click="close()" class="round_bt norm">
              <ion-icon :icon="arrowBack" />
            </button>
            <button class="counter"></button>
          </div>
          <div
            class="camera"
            style="
              display: flex;
              flex-direction: column;
              justify-content: space-around;
            "
          >
            <video
              :id="'player'"
              :src="url"
              preload="metadata"
              playsinline
              controls
              style="--plyr-color-main: #fc1955"
            ></video>
            
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </template>
  
  <style scoped>
  .camera {
    background: transparent;
    border-radius: 15px;
    width: 100%;
    flex-grow: 1;
    position: relative;
    overflow-y: scroll;
    overflow-x: hidden;
    max-width: 100%;
  }
  
  .counter {
    flex-grow: 1;
    text-align: center;
    font-weight: bold;
    background: #030207;
    color: rgb(234, 227, 240);
  }
  
  .round_bt:active {
    background: #1e1d22af;
  }
  
  .norm {
    color: rgb(234, 227, 240);
    background: #110c26;
  }
  
  .round_bt {
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 100%;
    font-size: 1.3rem;
  }
  
  
  .header {
    padding: 0.5rem;
    display: flex;
    align-content: center;
    justify-content: space-between;
  }
  
  .body {
    width: 100%;
    min-height: 100%;
    max-height: 100%;
    background: #030207;
    display: flex;
    flex-direction: column;
    color: rgb(234, 227, 240);
    font-family: "Poppins";
  }
  </style>
  
  <script lang="ts">
  import { defineComponent, defineEmits, Ref, toRef, watch } from "vue";
  import { arrowBack } from "ionicons/icons";
  import { IonModal, IonContent, IonIcon } from "@ionic/vue";
  import Plyr from 'plyr';
  
  export default defineComponent({
    props: {
      urlP: String,
      isOpen: Boolean,
    },
    components: {
      IonContent,
      IonModal,
      IonIcon,
    },
    setup(props, ctx) {
        const url = toRef(props, "urlP") as Ref<string>;
        const is_op = toRef(props, "isOpen");
        watch(is_op, (newop, oldop) => {
            if(newop) setTimeout(() => {
                new Plyr("#player");
            }, 200)
        });
        const emits = defineEmits(['close']);
        const close = () => {
            ctx.emit('close')
        }
        
        return {
            arrowBack,
            close,
            url
        }
    },
  });
  </script>