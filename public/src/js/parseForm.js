export default function parseForm(formElement) {
  const obj = {};
  Array.from(formElement.elements).forEach((e) => {
    obj[e.name] = e.value;
  });

  return obj;
}
