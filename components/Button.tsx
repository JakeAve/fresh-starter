import { JSX } from "preact/jsx-runtime";

interface Props extends JSX.HTMLAttributes<HTMLButtonElement> {
}

export function Button(props: Props) {


    const { class: classString, ...other } = props;
    return (
        <button
            class={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${classString}`}
            {...other}
        >
            {props.children}
        </button>
    );
}
