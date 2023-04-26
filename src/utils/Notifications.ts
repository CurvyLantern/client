import { notifications } from "@mantine/notifications";
import { useMemo } from "react";

const { show, hide, update } = notifications;

export const useRoomCreateToast = () => {
  const notificationId = "room-create-notification";
  const notification = useMemo(() => {
    return {
      start: () => {
        show({
          message: "creating room",
          loading: true,
          autoClose: false,
          id: notificationId,
          title: "room",
        });
      },
      update: () => {
        update({
          message: "room created now redirecting",
          loading: false,
          autoClose: 1000,
          id: notificationId,
          title: "room",
        });
      },
    };
  }, []);
  return notification;
};
export const useRoomJoinToast = () => {
  const notificationId = "room-notification";
  const notification = useMemo(() => {
    return {
      start: () => {
        show({
          id: notificationId,
          message: "",
          title: "Joining Room",
          autoClose: false,

          loading: true,
        });
      },
      update: () => {
        update({
          id: notificationId,
          message: "",
          title: "Joined room",
          autoClose: 5000,
          color: "blue",
        });
      },
      hide: () => {
        hide(notificationId);
      },
    };
  }, []);
  return notification;
};

export const useRoomCheckerToast = () => {
  const notificationId = "check-room-toast";
  const notification = useMemo(() => {
    return {
      start: () => {
        show({
          id: notificationId,
          message: "",
          title: "Checking Room",
          autoClose: false,

          loading: true,
        });
      },
      success: () => {
        update({
          id: notificationId,
          message: "",
          title: "redirecting to waitlist",
          color: "green",
        });
      },
      failure: () => {
        update({
          id: notificationId,
          message: "",
          title: "room not found , sorry",
          autoClose: 2000,
          color: "red",
        });
      },
      hide: () => {
        hide(notificationId);
      },
    };
  }, []);
  return notification;
};
