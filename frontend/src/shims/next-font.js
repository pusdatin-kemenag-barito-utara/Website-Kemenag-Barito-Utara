// Shim next/font/google — font dimuat via <link> di layout Astro.
export function Plus_Jakarta_Sans() {
  return { className: "" };
}

export function Inter() {
  return { className: "" };
}

export function Poppins() {
  return { className: "" };
}

export function Rubik() {
  return { className: "" };
}

const proxy = new Proxy(
  {},
  {
    get: () => () => ({ className: "" }),
  }
);

export default proxy;
