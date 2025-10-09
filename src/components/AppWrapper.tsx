import React, { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BACKGROUND_COLOR } from "../commons/constants";
 
type AppWrapperProps = PropsWithChildren<{}>;

export default function AppWrapper({ children }: AppWrapperProps) {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1" style={{ backgroundColor: BACKGROUND_COLOR }}>
        {children}
      </View>
    </SafeAreaView>
  );
}


