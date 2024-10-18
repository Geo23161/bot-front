<template>
    <ion-modal
      mode="ios"
      :is-open="isOpen"
      :breakpoints="[0.25, 0.45, 0.5, 0.7, 0.8]"
      :initial-breakpoint="0.45"
      @didDismiss="close"
    >
      <ion-content>
        <div class="body">
          <div class="btit">Limite atteinte</div>
          <div class="img_cont">
            <img :src="'../../imgs/sad.svg'" style="width: 60%" />
          </div>
          <div class="btext" v-html="text"></div>
          <button
            @click="router.push('/param?target=activ_abn' ), close()"
            class="butto upload"
          >
            Débloquer <ion-icon :icon="arrowForward" />
          </button>
        </div>
      </ion-content>
    </ion-modal>
  </template>
  
  <style scoped>
  .butto:active {
    box-shadow: none;
  }
  
  .upload {
    background: #fb4073;
    color: white;
    box-shadow: 0 10px 15px -3px #fb407398, 0 4px 6px -2px #17a74929;
  }
  
  .butto {
    width: 100%;
    padding: 1.5vh;
    font-size: 2.1vh;
    font-weight: 600;
    border-radius: 15px;
    margin-top: 0.8rem;
  }
  
  .btext {
    font-size: 1.9vh;
    line-height: 3vh;
    text-align: center;
    color: white;
  }
  
  .img_cont {
    padding-top: 1.7rem;
    padding-bottom: 0.6rem;
    display: flex;
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
  import { IonModal, IonContent } from "@ionic/vue";
  import { arrowForward } from "ionicons/icons";
  import { useRouter } from "vue-router";
  
  export default defineComponent({
    components: {
      IonModal,
      IonContent,
    },
    props: {
      isOpen: Boolean,
      redirect: String,
      text: String,
    },
    setup(props, ctx) {
      const emits = defineEmits(["close"]);
      const close = () => {
        ctx.emit("close");
      };
      const router = useRouter();
      return {
        close,
        router,
        arrowForward,
      };
    },
  });
  </script>