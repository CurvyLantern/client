import {
  hideNotification,
  showNotification,
  updateNotification,
} from "@mantine/notifications";
import { useMemo } from "react";

export const useRoomCreateNotification = () => {
  const notificationId = "room-create-notification";
  const notification = useMemo(() => {
    return {
      start: () => {
        showNotification({
          message: "creating room",
          loading: true,
          autoClose: false,
          id: notificationId,
          title: "room",
          disallowClose: true,
        });
      },
      update: () => {
        updateNotification({
          message: "room created now redirecting",
          loading: false,
          autoClose: 1000,
          id: notificationId,
          title: "room",
          disallowClose: true,
        });
      },
    };
  }, []);
  return notification;
};
export const useRoomJoinNotification = () => {
  const notificationId = "room-notification";
  const notification = useMemo(() => {
    return {
      start: () => {
        showNotification({
          id: notificationId,
          message: "",
          title: "Joining Room",
          autoClose: false,
          disallowClose: true,
          loading: true,
        });
      },
      update: () => {
        updateNotification({
          id: notificationId,
          message: "",
          title: "Joined room",
          autoClose: 5000,
          color: "blue",
          disallowClose: true,
        });
      },
      hide: () => {
        hideNotification(notificationId);
      },
    };
  }, []);
  return notification;
};
