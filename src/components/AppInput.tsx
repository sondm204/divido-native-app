import React from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function AppInput({ label, error, ...props }: AppInputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-sm text-slate-600 mb-2">{label}</Text>}
      <TextInput
        {...props}
        className={`bg-white rounded-xl border p-3 ${
          error ? "border-red-500" : "border-slate-200"
        }`}
        placeholderTextColor="#9CA3AF"
      />
      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
}
