import {
  hideNotification,
  showNotification,
  updateNotification,
} from "@mantine/notifications";
import { useMemo } from "react";

export const useRoomCreateToast = () => {
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
export const useRoomJoinToast = () => {
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

export const useRoomCheckerToast = () => {
  const notificationId = "check-room-toast";
  const notification = useMemo(() => {
    return {
      start: () => {
        showNotification({
          id: notificationId,
          message: "",
          title: "Checking Room",
          autoClose: false,
          disallowClose: true,
          loading: true,
        });
      },
      success: () => {
        updateNotification({
          id: notificationId,
          message: "",
          title: "redirecting to waitlist",
          color: "green",
          disallowClose: true,
        });
      },
      failure: () => {
        updateNotification({
          id: notificationId,
          message: "",
          title: "room not found , sorry",
          autoClose: 2000,
          color: "red",
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
