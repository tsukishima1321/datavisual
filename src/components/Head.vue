<script setup lang="ts">

import { HomeFilled, MoreFilled } from '@element-plus/icons-vue';
</script>

<template>
    <el-menu :default-active="'/'" class="headermenu" mode="horizontal" :ellipsis="false" :router="true">
        <el-menu-item index="/"><el-icon>
            <HomeFilled />
            </el-icon>Home</el-menu-item>
        <el-menu-item index="/about"><el-icon>
            <MoreFilled />
            </el-icon>About</el-menu-item>
    </el-menu>
</template>

<style scoped>
.head {
    width: 100%;
    margin: 0;
}

.el-menu--horizontal {
    width: 100%;
}
</style>