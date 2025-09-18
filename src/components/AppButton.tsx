import React from "react";
import { TouchableOpacity, Text, ViewStyle } from "react-native";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  style?: ViewStyle;
  className?: string;
}

export default function AppButton({
  title,
  onPress,
  disabled = false,
  variant = "primary",
  style,
  className,
}: AppButtonProps) {
  const baseStyle =
    "py-3 rounded-xl items-center justify-center";

  const variantStyle =
    variant === "primary"
      ? "bg-[#0F6BF0]"
      : variant === "secondary"
      ? "bg-slate-200"
      : "bg-red-500";

  const textStyle =
    variant === "secondary" ? "text-slate-700" : "text-white";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${baseStyle} ${variantStyle} ${className} ${
        disabled ? "opacity-50" : ""
      }`}
      style={style}
    >
      <Text className={`font-semibold ${textStyle}`}>{title}</Text>
    </TouchableOpacity>
  );
}
