"use client";

import { useRef, useState } from "react";

export function useModalExit(closedValue = false) {
  const [value, setValueState] = useState(closedValue);
  const [closing, setClosing] = useState(false);
  const valueRef = useRef(closedValue);

  function setValue(nextValue) {
    const next =
      typeof nextValue === "function" ? nextValue(valueRef.current) : nextValue;
    if (
      Object.is(next, closedValue) &&
      !Object.is(valueRef.current, closedValue)
    ) {
      setClosing(true);
      return;
    }

    valueRef.current = next;
    setClosing(false);
    setValueState(next);
  }

  function onAnimationEnd(event) {
    if (closing && event.target === event.currentTarget) {
      valueRef.current = closedValue;
      setValueState(closedValue);
      setClosing(false);
    }
  }

  return [value, setValue, closing, onAnimationEnd];
}
