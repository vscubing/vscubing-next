import { tailwindConfig } from "@/app/_utils/tailwind";

export function handleSliderStylesOnChange(
  elem: HTMLInputElement,
  value = elem.value,
) {
  elem.style.setProperty("--min", elem.min == "" ? "0" : elem.min);
  elem.style.setProperty("--max", elem.max == "" ? "100" : elem.max);
  elem.style.setProperty("--value", value);
  elem.classList.add("slider-styled", "slider-progress");
}

const colors = tailwindConfig.theme.colors;
export const sliderStyles = `
/*generated with Input range slider CSS style generator (version 20211225)
https://toughengineer.github.io/demo/slider-styler*/
input[type=range].slider-styled {
  height: 1rem;
  -webkit-appearance: none;
}

/*progress support*/
input[type=range].slider-styled.slider-progress {
  --range: calc(var(--max) - var(--min));
  --ratio: calc((var(--value) - var(--min)) / var(--range));
  --sx: calc(0.5 * 1rem + var(--ratio) * (100% - 1rem));
}

/*webkit*/
input[type=range].slider-styled::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  border-radius: 1em;
  background: ${colors.white[100]};
  border: none;
  box-shadow: none;
  margin-top: calc(0.25rem * 0.5 - 1rem * 0.5);
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

input[type=range].slider-styled::-webkit-slider-runnable-track {
  height: 0.25rem;
  border: none;
  border-radius: 0.5em;
  background: ${colors.grey[60]};
  box-shadow: none;
}

input[type=range].slider-styled::-webkit-slider-thumb:hover {
  box-shadow: 0px 0px 0px 0.25rem ${colors.primary[80]};
}

input[type=range].slider-styled::-webkit-slider-thumb:active {
  box-shadow: 0px 0px 0px 0.125rem ${colors.primary[80]};
}

input[type=range].slider-styled.slider-progress::-webkit-slider-runnable-track {
  background: linear-gradient(${colors.white[100]},${colors.white[100]}) 0/var(--sx) 100% no-repeat, ${colors.grey[60]};
}

/*mozilla*/
input[type=range].slider-styled::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 1em;
  background: ${colors.white[100]};
  border: none;
  box-shadow: none;
}

input[type=range].slider-styled::-moz-range-track {
  height: 0.25rem;
  border: none;
  border-radius: 0.5em;
  background: ${colors.grey[60]};
  box-shadow: none;
}

input[type=range].slider-styled::-moz-range-thumb:hover {
  box-shadow: 0px 0px 0px 0.25rem ${colors.primary[80]};
}

input[type=range].slider-styled::-moz-range-thumb:active {
  box-shadow: 0px 0px 0px 0.125rem ${colors.primary[80]};
}

input[type=range].slider-styled.slider-progress::-moz-range-track {
  background: linear-gradient(${colors.white[100]},${colors.white[100]}) 0/var(--sx) 100% no-repeat, ${colors.grey[60]};
}

/*ms*/
input[type=range].slider-styled::-ms-fill-upper {
  background: transparent;
  border-color: transparent;
}

input[type=range].slider-styled::-ms-fill-lower {
  background: transparent;
  border-color: transparent;
}

input[type=range].slider-styled::-ms-thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 1em;
  background: ${colors.white[100]};
  border: none;
  box-shadow: none;
  margin-top: 0;
  box-sizing: border-box;
}

input[type=range].slider-styled::-ms-track {
  height: 0.25rem;
  border-radius: 0.5em;
  background: ${colors.grey[60]};
  border: none;
  box-shadow: none;
  box-sizing: border-box;
}

input[type=range].slider-styled::-ms-thumb:hover {
  box-shadow: 0px 0px 0px 0.25rem ${colors.primary[80]};
}

input[type=range].slider-styled::-ms-thumb:active {
  box-shadow: 0px 0px 0px 0.125rem ${colors.primary[80]};
}

input[type=range].slider-styled.slider-progress::-ms-fill-lower {
  height: 0.25rem;
  border-radius: 0.5em 0 0 0.5em;
  margin: 0;
  background: ${colors.white[100]};
  border: none;
  border-right-width: 0;
}
`;
