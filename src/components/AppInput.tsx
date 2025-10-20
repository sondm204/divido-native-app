import React from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";
import { CARD_COLOR, PLACEHOLDER_COLOR, TEXT_COLOR } from "../commons/constants";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export default function AppInput({ label, error, className, style, ...props }: AppInputProps) {
  return (
    <View>
      {label && <Text className="text-sm text-slate-600 mb-2">{label}</Text>}
      <TextInput
        {...props}
        className={`rounded-xl border p-3 ${className} ${
          error ? "border-red-500" : "border-slate-700"
        }`}
        style={[
          { backgroundColor: CARD_COLOR, color: TEXT_COLOR },
          style
        ]}
        placeholderTextColor={PLACEHOLDER_COLOR}
      />
      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
}
