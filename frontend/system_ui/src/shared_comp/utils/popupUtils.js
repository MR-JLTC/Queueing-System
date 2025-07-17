export const showPopupMessage = (setPopup, type, message, duration = 3000) => {
  setPopup({ type, message });

  setTimeout(() => {
    setPopup(null);
  }, duration);
};
