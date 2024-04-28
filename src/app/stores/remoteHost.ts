import { ref, type Ref } from 'vue';
import { defineStore } from 'pinia';

export const useRemoteHostStore = defineStore('remoteHost', () => {
    const remoteHost: Ref<() => string> = ref(() => 'http://unknown');

    function setDynamicRemoteHost(host: () => string) {
        remoteHost.value = host;
    }

    function setRemoteHost(host: string) {
        remoteHost.value = () => host;
    }

    return { remoteHost, setDynamicRemoteHost, setRemoteHost };
});
