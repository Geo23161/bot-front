<template >
    <ion-page >
        <ion-content >
            <div style="width: 100%; padding-top: 15rem; display: flex; justify-content: center;" >
                <img :src="'../../imgs/thank.svg'" style="width: 60vw;" />
            </div>
            <div style="display: flex; justify-content: space-around; font-size: 2.3rem; font-weight: bold; ">
                <div style="text-align: center;" >
                    Merci beaucoup !
                </div>
            </div>
            <div style="font-size: 1.2rem; text-align: center;" >
                {{ text }}
            </div>
        </ion-content>
    </ion-page>
</template>

<style scoped>
div {
	font-family: 'Poppins';
}
</style>


<script setup lang="ts" >
import { IonPage, IonContent, onIonViewWillEnter } from "@ionic/vue"
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const goal = ref('')
const route = useRoute()
const text = computed(() => {
    if (goal.value == 'livraison') {
        return "Nous vous contacterons très vite pour la livraison du produit"
    } else {
        return ""
    }
})

onIonViewWillEnter(() => {
    goal.value = route.query['goal'] as string
})

</script>
