
<script setup lang="ts">
import { computed } from "vue";

type CardVariant = "default" | "primary" | "accent";

interface Props {
    label: string;
    value: string | number;
    variant?: CardVariant;
}

const props = withDefaults(defineProps<Props>(), {
    variant: "default",
});

const variantClasses = computed(() => {
    const variants = {
        default: {
            card: "bg-light-background border-text-primary",
            label: "bg-primary text-white",
        },
        primary: {
            card: "bg-indigo-500 border-text-primary",
            label: "bg-accent text-gray-900",
        },
        accent: {
            card: "bg-accent border-text-primary",
            label: "bg-white text-gray-900",
        },
    };

    return variants[props.variant];
});
</script>

<template>
    <div
        class="flex flex-col justify-between gap-3 p-3 sm:p-4 
        min-w-0 flex-1 min-h-26.25 
        border rounded-2xl transition-all duration-300"
        :class="variantClasses.card"
    >
        <!-- LABEL -->
        <div>
            <span
                class="inline-flex items-center px-4 py-1 
                text-[10px] sm:text-xs font-medium 
                rounded-lg border border-text-primary"
                :class="variantClasses.label"
            >
                {{ label }}
            </span>
        </div>

        <!-- VALUE -->
        <h3 class="text-3xl sm:text-4xl font-extrabold text-gray-950">
            {{ value }}
        </h3>
    </div>
</template>
