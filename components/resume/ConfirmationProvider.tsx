"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
const Context = createContext<(message: string) => Promise<boolean>>(() =>
  Promise.resolve(false),
);
export const useConfirm = () => useContext(Context);
export default function ConfirmationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState<{
    message: string;
    resolve: (value: boolean) => void;
  } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (pending) {
      dialog.current?.showModal();
      cancel.current?.focus();
    } else dialog.current?.close();
  }, [pending]);
  useEffect(
    () => () => {
      pending?.resolve(false);
    },
    [pending],
  );
  function finish(value: boolean) {
    pending?.resolve(value);
    setPending(null);
  }
  return (
    <Context.Provider
      value={(message) =>
        new Promise((resolve) =>
          setPending((current) => {
            current?.resolve(false);
            return { message, resolve };
          }),
        )
      }
    >
      {children}
      <dialog
        ref={dialog}
        className="confirmation-dialog"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-message"
        onCancel={(e) => {
          e.preventDefault();
          finish(false);
        }}
      >
        <h2 id="confirmation-title">Before you continue</h2>
        <p id="confirmation-message">{pending?.message}</p>
        <div>
          <button
            className="button outline small"
            ref={cancel}
            onClick={() => finish(false)}
          >
            Cancel
          </button>
          <button className="button dark small" onClick={() => finish(true)}>
            Continue
          </button>
        </div>
      </dialog>
    </Context.Provider>
  );
}
