<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import  db from './services/firebase.ts'
import {doc, collection, DocumentSnapshot, getDoc} from "firebase/firestore"

import AuthLayout from './components/AuthLayout.vue'
import SiteLayout from './components/SiteLayout.vue'

const route = useRoute();
const activeLayout = computed(() => route.meta.layout ?? 'site');

function testingData(){
const testData = doc(db, "test/testing");
getDoc(testData).then((ds) => {
if(ds.exists()){
  console.log(ds.data());
}
else{console.log("data doesn't exist");}
});}

//testingData();

</script>

<template>
  <v-app>
    <SiteLayout v-if="activeLayout === 'site'">
      <router-view />
    </SiteLayout>
    <AuthLayout v-else-if="activeLayout === 'auth'">
      <router-view />
    </AuthLayout>
    <router-view v-else />
  </v-app>
</template>
