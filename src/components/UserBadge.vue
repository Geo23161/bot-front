<template >
    <button v-if="status != 'vip'" class="icor" :class="[status]" :style="{
        width: width,
        height: height,
        maxHeight: height,
        maxWidth : width
    }">
        <ion-icon class="in_room"  :class="{
            force_white : status == 'golden' && width == '3.1vh',
            sauf : status != 'golden'&& width == '3.1vh',
            gold_f : status == 'golden'
        }" :icon=" status == 'free' ? closeCircle : checkmarkCircle" :style="{
            fontSize : size
        }" />
    </button>
    <button v-else class=" vip" :class="{
        fancybutu2 : size =='1vh',
        fancybutu : size != '1vh'
    }" :style="{
            fontSize : size
        }"
        >
        VIP
    </button>
</template>
 
<style scoped >
.in_room{
    position: relative;
    top: 0.1vh;
    right: .08vh;
}
.sauf {
    position: relative; 
    top: .11vh;
    right: .1225vh;
}
.force_white {
    position: relative;
    top: .12vh;
}

.gold_f{
    color: rgb(70, 70, 70) !important;
}
.vip:active {
    background: linear-gradient(to left, rgba(255, 255, 255, 0.527), transparent);
    background-color: #fc1955;
}

.vip {
    background: linear-gradient(to left, rgba(255, 255, 255, 0.336), transparent);
    background-color: #edfc19 !important;
    color: black;
}

.fancybutu2 {
    margin-right: 0.6rem;
    padding: 0.6vh 1vh;
    font-family: 'PT Serif', serif;
    border-radius: 12px;
    font-weight: bold;
}
.fancybutu {
    margin-right: 0.6rem;
    padding-top: 1vh;
    padding-bottom: 0.5vh;
    padding-left: 1vh;
    padding-right: 1vh;
    font-family: 'PT Serif', serif;
    border-radius: 12px;
    font-weight: bold;
}
.golden {
    background: linear-gradient(to left, #c09433, #faf298, #c09433) !important;
}

.silver:active {
    background: linear-gradient(to left, rgba(255, 255, 255, 0.651), transparent);
    background-color: #5d28f0;
}

.silver_plus {
    background-color: #fc9e32 !important;
    color: white;
}

.silver {
    background-color: #5d28f0 !important;
    color: white;
}

.free:active {
    background: linear-gradient(to left, rgba(255, 255, 255, 0.651), transparent);
    background-color: red !important;
}

.free {
    background-color: red !important;
    color: white;
}

.icor {
    border-radius: 100%;
    background: linear-gradient(to left, rgba(255, 255, 255, 0.459), transparent);
    display: inline-block;
}
</style>

<script setup lang="ts">
import { IonIcon } from "@ionic/vue"
import { checkmark, checkmarkCircle, checkmarkDone, checkmarkDoneCircle, ribbon, closeCircle } from "ionicons/icons";

const props = defineProps({
    status: String,
    width: String,
    height: String,
    size : String
})
</script>