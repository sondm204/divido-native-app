import { Mixpanel as MixpanelReactNative } from "mixpanel-react-native";
const trackAutomaticEvents = false;
const mixpanel = new MixpanelReactNative("82a840cf7122c627a5ea439ce0fcd4df", trackAutomaticEvents);
mixpanel.init();

export let Mixpanel = {
  identify: (id: string) => {
    mixpanel.identify(id);
  },
  track: (name: string, props: any) => {
    mixpanel.track(name, props);
  },
  trackScreenView: (screenName: string, props: any = {}) => {
    mixpanel.track("Screen View", { screen_name: screenName, ...props });
  },
  timeEvent: (name: string) => {
    mixpanel.timeEvent(name);
  },
  people: {
    set: (props: any) => {
      mixpanel.getPeople().set(props);
    },
  },
  reset: () => {
    mixpanel.reset();
  }
};
