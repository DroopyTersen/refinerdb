import { useEffect } from "react";

const useDebounce = (fn: () => any, ms: number = 0, args: any[] = []) => {
  useEffect(() => {
    const handle = setTimeout(fn.bind(null, args), ms);

    return () => {
      // if args change then clear timeout
      clearTimeout(handle);
    };
  }, args);
};

export default useDebounce;
// EXAMPLE usage
// function TextBox({ value, onChange }) {
//   let [inputValue, setInputValue] = useState(value);
//   useDebounce(
//     () => {
//       if (value != inputValue) onChange(inputValue);
//     },
//     300,
//     [inputValue]
//   );
//   return <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />;
// }
