
<script setup lang="ts">
import { computed } from "vue";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

type ButtonSize = "sm" | "md" | "lg";

type ButtonType = "button" | "submit" | "reset";

interface Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  rounded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  type: "button",
  disabled: false,
  loading: false,
  block: false,
  rounded: false,
});

const isDisabled = computed(
  () => props.disabled || props.loading
);

const buttonClasses = computed(() => {
  const base = [
    "inline-flex items-center justify-center gap-2",
    "font-medium",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ];

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary",

    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-400",

    outline:
      "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400",

    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",

    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",

    success:
      "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  return [
    ...base,
    variants[props.variant],
    sizes[props.size],
    props.block ? "w-full" : "",
    props.rounded ? "rounded-full" : "rounded-lg",
  ];
});
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :class="buttonClasses"
  >
    <!-- Loading indicator -->
    <svg
      v-if="loading"
      class="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>

    <slot />

  </button>
</template>
